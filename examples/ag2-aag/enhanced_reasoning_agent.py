import os
import threading
import time
from typing import Any, Dict, List, Optional
from autogen import UserProxyAgent, ReasoningAgent
from dotenv import load_dotenv
from web.web_server import WebVisualizer
from agent_network import ExpertFinderAgent

# Load environment variables and configure API
load_dotenv()
config_list = [{"model": "gpt-4", "api_key": os.environ.get("OPENAI_API_KEY")}]

class EnhancedThinkerAgent:
    def __init__(self):
        """Initialize the enhanced thinker agent with web visualization."""
        self.visualizer = WebVisualizer()
        self.chat_complete = threading.Event()
        self.chat_result = None
        self.fxn_thinking = False
        self.VISUALIZATION_DELAY = 3  # Reduced delay for better responsiveness
        
    def create_the_expert_finder(self):
        """Create and configure the expert finder agent with visualization hooks."""
        expert_finder = ExpertFinderAgent()
        
        # Wrap the expert finder's methods to show FXN thinking state
        original_query = expert_finder.query_experts
        def wrapped_query_experts(*args, **kwargs):
            self.visualizer.update_agent_status("FXN", "Searching network...", thinking=True)
            time.sleep(self.VISUALIZATION_DELAY)
            result = original_query(*args, **kwargs)
            self.visualizer.update_agent_status("FXN", "Search complete", thinking=False)
            time.sleep(self.VISUALIZATION_DELAY)
            return result
        expert_finder.query_experts = wrapped_query_experts
        
        return expert_finder
        
    def create_the_reasoner(self):
        """Create and configure the reasoning agent with visualization hooks."""
        reasoning_agent = ReasoningAgent(
            name="reason_agent",
            llm_config={"config_list": config_list},
            verbose=True,
            system_message="""You are a thoughtful reasoning agent that coordinates with other agents to solve problems.
            When faced with domain-specific questions:
            1. Always check if external expertise would be valuable by sending a message containing 'need_expert'
            2. Consider the input from both the expert finder (FXN) and the tot_grader
            3. Explicitly state when you're uncertain and need to consult others
            """,
            reason_config={
                "beam_size": 2,  # Increased to consider more paths
                "max_depth": 4   # Increased to allow deeper reasoning
            }
        )
        
        original_receive = reasoning_agent.receive
        def wrapped_receive(message, sender, request_reply=None, silent=False):
            try:
                self.visualizer.update_agent_status(reasoning_agent.name, message, thinking=True)
                time.sleep(self.VISUALIZATION_DELAY)
                
                # Always try to consult expert finder first
                self.visualizer.update_agent_status(
                    reasoning_agent.name,
                    "Checking if expert consultation would be valuable..."
                )
                expert_request = f"need_expert: {message}"
                expert_response = self.expert_finder.receive(expert_request, reasoning_agent.name)
                
                if "Found relevant expert" in expert_response:
                    self.visualizer.update_agent_status(
                        "FXN", 
                        "Expert found, incorporating expertise...", 
                        thinking=True
                    )
                    time.sleep(self.VISUALIZATION_DELAY)
                    
                    # Modify the message to include expert context
                    enhanced_message = f"{message}\n\nExpert Context: {expert_response}"
                    result = original_receive(enhanced_message, sender, request_reply, silent)
                else:
                    result = original_receive(message, sender, request_reply, silent)
                
                # Grade the response
                self.visualizer.update_agent_status(
                    "tot_grader",
                    "Grading response quality...",
                    thinking=True
                )
                grade_result = self.grade_response(result)
                self.visualizer.update_agent_status(
                    "tot_grader",
                    f"Grade: {grade_result}",
                    thinking=False
                )
                
                response_message = result if result else "Processing complete (no response)"
                self.visualizer.update_agent_status(reasoning_agent.name, response_message, thinking=False)
                return result
                
            except Exception as e:
                error_message = f"Error in reasoning process: {str(e)}"
                self.visualizer.update_agent_status(reasoning_agent.name, error_message)
                return f"I encountered an error: {str(e)}"
            
        reasoning_agent.receive = wrapped_receive
        return reasoning_agent

    def create_the_user_proxy(self):
        """Create and configure the user proxy agent with visualization hooks."""
        user_proxy = UserProxyAgent(
            name="user_proxy",
            human_input_mode="NEVER",
            code_execution_config={"use_docker": False},
            max_consecutive_auto_reply=10,
            llm_config={"config_list": config_list},
            system_message="""You are a user proxy that helps coordinate between the reasoning agent and other specialized agents.
            Your role is to:
            1. Forward requests to appropriate agents
            2. Monitor and report on agent status
            3. Keep track of the conversation flow"""
        )
        
        # Wrap the receive method to update visualization
        original_receive = user_proxy.receive
        def wrapped_receive(message, sender, request_reply=None, silent=False):
            self.visualizer.update_agent_status(user_proxy.name, message, thinking=True)
            time.sleep(self.VISUALIZATION_DELAY)
            result = original_receive(message, sender, request_reply, silent)
            self.visualizer.update_agent_status(
                user_proxy.name, 
                result if result else "Done processing"
            )
            time.sleep(self.VISUALIZATION_DELAY)
            return result
        user_proxy.receive = wrapped_receive
        
        return user_proxy

    def grade_response(self, response: str) -> str:
        """Grade the quality of a response with focus on expert findings."""
        criteria = {
            "expert_found": 0,        # Was an expert found?
            "expert_relevance": 0,    # Is the expert relevant?
            "expert_details": 0,      # Are expert details provided?
            "expert_status": 0,       # Is the expert active?
            "response_quality": 0     # Overall response quality
        }
        
        try:
            # Check if we found an expert
            if "Found relevant expert" in response:
                criteria["expert_found"] = 2
                
                # Parse the expert details
                try:
                    # Extract the JSON part of the response
                    import json
                    start_idx = response.find('{')
                    end_idx = response.rfind('}') + 1
                    if start_idx >= 0 and end_idx > 0:
                        expert_json = json.loads(response[start_idx:end_idx])
                        
                        # Check expert status
                        if expert_json.get('status') == 'active':
                            criteria["expert_status"] = 2
                        
                        # Check for detailed information
                        if expert_json.get('description'):
                            criteria["expert_details"] = 2
                        
                        # Check expert name and fee
                        if expert_json.get('name') and expert_json.get('fee_per_day') is not None:
                            criteria["expert_details"] += 1
                        
                        # Evaluate relevance based on description
                        description = expert_json.get('description', '').lower()
                        if len(description) > 10:  # Basic length check
                            criteria["expert_relevance"] = 2
                            if len(description.split()) > 5:  # More detailed description
                                criteria["expert_relevance"] += 1
                except json.JSONDecodeError:
                    # If JSON parsing fails, reduce scores
                    criteria["expert_details"] = 0
                    criteria["expert_relevance"] = 0
            
            # Overall response quality
            if len(response) > 0:
                criteria["response_quality"] = 2
                
            # Calculate total score out of 10
            max_possible = 10
            current_total = sum(criteria.values())
            scaled_score = (current_total / max_possible) * 10
            
            return f"{scaled_score:.1f}/10.0"
            
        except Exception as e:
            print(f"Error in grading: {str(e)}")
            return "0.0/10.0"

    def run_chat(self, question: str) -> None:
        """Run the chat in a separate thread."""
        # Update visualization with initial question
        self.visualizer.update_agent_status(
            "user_proxy", 
            f"Initial question: {question}"
        )
        time.sleep(self.VISUALIZATION_DELAY)
        
        chat_result = self.user_proxy.initiate_chat(
            self.reasoning_agent, 
            message=question
        )
        self.chat_result = chat_result
        self.chat_complete.set()

    def initiate_a_chat(self, question: str) -> Any:
        """Start the visualization and chat in separate threads."""
        print("Creating agents...")
        
        # Create agents first
        self.user_proxy = self.create_the_user_proxy()
        print("Created user proxy")
        
        self.expert_finder = self.create_the_expert_finder()
        print("Created expert finder")
        
        self.reasoning_agent = self.create_the_reasoner()
        print("Created reasoning agent")
        
        # Start web server in a separate thread
        print("Starting web visualization server...")
        server_thread = threading.Thread(target=self.visualizer.start)
        server_thread.daemon = True
        server_thread.start()
        
        print("Starting chat thread...")
        chat_thread = threading.Thread(target=self.run_chat, args=(question,))
        chat_thread.daemon = True
        chat_thread.start()
        
        print("\nVisualization is available at http://localhost:8000")
        
        # Wait for chat to complete
        self.chat_complete.wait()
        return self.chat_result


if __name__ == "__main__":
    # Example usage
    ta = EnhancedThinkerAgent()
    
    # Example question that might require expert consultation
    question = "What are the key considerations for implementing a distributed machine learning system?"
    
    result = ta.initiate_a_chat(question)
    
    print("\nChat History:")
    chat_history = result.chat_history
    for history in chat_history:
        print("role:", history["role"])
        print("name:", history["name"])
        print("content:", history["content"])
        print("------------------------------")

    print(f"Cost: {result.cost}")
