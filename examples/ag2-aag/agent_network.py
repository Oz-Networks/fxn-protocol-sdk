import os
import requests
import json
from urllib.parse import urlencode

class ExpertFinderAgent:
    """Agent responsible for finding and consulting domain experts."""
    
    def __init__(self, base_url="https://fxn.world/api"):
        self.base_url = base_url
        self.name = "expert_finder"
        
    def query_experts(self, topic, page_size=24):
        """Query the API for experts on a specific topic."""
        endpoint = f"{self.base_url}/agents"
        
        # Simplified query - just pagination and sorting
        params = {
            "pageSize": page_size,
            "sort": json.dumps({
                "field": "createdAt",
                "direction": "desc"
            })
        }
        
        try:
            # Make the API request
            response = requests.get(
                f"{endpoint}?{urlencode(params)}",
                headers={"Content-Type": "application/json"}
            )
            
            # Add debug logging
            print(f"API Request URL: {response.url}")
            print(f"Response status: {response.status_code}")
            if not response.ok:
                print(f"Error response: {response.text}")
                
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            print(f"Error querying experts: {e}")
            return None
            
    def format_expert_info(self, expert):
        """Format expert information for agent consumption."""
        return {
            'name': expert.get('name', ''),
            'description': expert.get('description', ''),
            'fee_per_day': expert.get('feePerDay', 0),
            'status': expert.get('status', '')
        }
        
    def find_relevant_expert(self, query):
        """Find the most relevant expert for a given query."""
        try:
            experts_response = self.query_experts(None)
            if experts_response and 'agents' in experts_response:
                experts = experts_response['agents']
                if experts:
                    # Filter for active agents only
                    active_experts = [e for e in experts if e.get('status') == 'active']
                    
                    # Score each expert based on description matching
                    query_terms = set(self._extract_topics(query))
                    scored_experts = []
                    
                    for expert in active_experts:
                        description = expert.get('description', '').lower()
                        if not description:
                            continue
                            
                        # Calculate relevance score based on term matches in description
                        description_terms = set(self._extract_topics(description))
                        score = len(description_terms.intersection(query_terms))
                        
                        if score > 0:
                            scored_experts.append((score, expert))
                    
                    # Return the best match if any
                    if scored_experts:
                        scored_experts.sort(reverse=True)  # Sort by score
                        return self.format_expert_info(scored_experts[0][1])
            
            return None
        except Exception as e:
            print(f"Error finding relevant expert: {e}")
            return None
        
    def _extract_topics(self, text):
        """Extract potential topics from text."""
        if not text:
            return []
            
        # Remove common words and split into potential topics
        common_words = {'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'and',
                       'this', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
                       'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'test', 'part'}
        
        words = text.lower().split()
        topics = [
            word for word in words 
            if word not in common_words
            and len(word) > 2  # Reduced minimum length to catch more meaningful terms
            and not any(char in word for char in '.,?!:;()')
        ]
        print(f"Extracted topics from text: {topics}")
        return topics

    def receive(self, message, sender):
        """Handle incoming messages from other agents."""
        if "need_expert" in message.lower():
            # Clean the message by removing the 'need_expert:' prefix
            query = message.lower().replace('need_expert:', '').strip()
            expert = self.find_relevant_expert(query)
            if expert:
                return f"Found relevant expert: {json.dumps(expert, indent=2)}"
            return "No relevant experts found."
        return "I can help find experts. Please include 'need_expert' in your request."