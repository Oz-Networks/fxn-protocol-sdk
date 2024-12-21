# bookkeeping_swarm.py
import os
import json
import base58
import asyncio
import aiohttp
from datetime import datetime
from typing import Dict, List
from pathlib import Path
from dotenv import load_dotenv

import autogen
from autogen import Agent, AssistantAgent, UserProxyAgent
from autogen.agentchat.contrib.multimodal_conversable_agent import MultimodalConversableAgent
from solana.keypair import Keypair
from solana.transaction import Transaction

# Load environment variables
load_dotenv()

print(f"Env is: {os.getenv('AUTOGEN_USE_DOCKER')}")

class BookkeepingSwarm:
    OFFER_INTERVAL = 300  # 5 minutes in seconds

    def __init__(self, wallet_private_key: str, port: int = 3000, offer_interval: int = 300):
        self.OFFER_INTERVAL = offer_interval  # Allow override in tests
        self.config_list = [
            {
                "model": "gpt-4-vision-preview",
                "api_key": os.getenv("OPENAI_API_KEY")
            }
        ]

        self.fxn_sdk_url = f"http://localhost:{port}"
        print(f"Initializing swarm with SDK URL: {self.fxn_sdk_url}")

        # Connect to the FXN client
        self.fxn_sdk_url = f"http://localhost:{port}"
        self.session = None  # Will be initialized in start()

        # Initialize Solana Wallet
        self.keypair = Keypair.from_secret_key(base58.b58decode(wallet_private_key))

        # Create working directory
        self.work_dir = Path("workspace")
        self.work_dir.mkdir(exist_ok=True)

        # Initialize agents
        self.image_analyzer = MultimodalConversableAgent(
            name="image_analyzer",
            system_message="""You analyze receipt images to extract relevant information.
            Extract date, total amount, merchant name, and categorize the purchase.
            Return data in a structured format.""",
            llm_config={"config_list": self.config_list}
        )

        self.data_processor = AssistantAgent(
            name="data_processor",
            system_message="""You process and categorize receipt data.
            Standardize formats, validate data, and ensure consistency.
            Categorize transactions into predefined categories.""",
            llm_config={"config_list": self.config_list}
        )

        self.spreadsheet_manager = UserProxyAgent(
            name="spreadsheet_manager",
            human_input_mode="NEVER",
            system_message="""You prepare receipt data for storage.
            Format data according to specified schema and validate all fields.""",
            code_execution_config={
                "work_dir": str(self.work_dir),
                "use_docker": False
            }
        )

        # Initialize HTTP session for API calls
        self.session = aiohttp.ClientSession()

        # Setup group chat
        self.group_chat = autogen.GroupChat(
            agents=[self.image_analyzer, self.data_processor, self.spreadsheet_manager],
            messages=[],
            max_round=10
        )
        self.manager = autogen.GroupChatManager(
            groupchat=self.group_chat,
            llm_config={"config_list": self.config_list}
        )

    async def process_receipt(self, image_url: str, requestor_url: str) -> Dict:
        """Process a single receipt image and return categorized data"""
        try:
            print(f"\n=== Processing receipt ===")
            print(f"Image URL: {image_url}")
            print(f"Requestor URL: {requestor_url}")

            # First, analyze the image
            image_analysis = await self.manager.a_initiate_chat(
                self.image_analyzer,
                message={
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Process this receipt image and extract all relevant information"},
                        {"type": "image_url", "image_url": image_url}
                    ]
                }
            )
            print("Image analysis completed")

            # Process the extracted data
            processed_data = await self.manager.a_initiate_chat(
                self.data_processor,
                message={
                    "role": "user",
                    "content": f"Process and categorize this receipt data: {json.dumps(image_analysis.summary)}"
                }
            )
            print("Data processing completed")

            return self._sign_payload(processed_data.summary)
        except Exception as e:
            print(f"Error in process_receipt: {e}")
            raise

    async def handle_subscriber_request(self, request_data: Dict, callback_url: str) -> None:
        """Process a subscriber's request and send back results"""
        try:
            print(f"\n=== Handling subscriber request ===")
            print(f"Request data: {request_data}")
            print(f"Callback URL: {callback_url}")

            # Process the receipt
            receipt_data = await self.process_receipt(
                request_data["image_url"],
                callback_url
            )
            print("Receipt processing completed")

            # Post results back to subscriber
            payload = self._sign_payload({
                "type": "receipt_processed",
                "timestamp": datetime.utcnow().isoformat(),
                "data": receipt_data,
                "request_id": request_data.get("request_id")
            })

            print(f"Sending results to: {callback_url}/results")
            print(f"Payload: {payload}")

            async with self.session.post(f"{callback_url}/results", json=payload) as response:
                print(f"Response status: {response.status}")
                if response.status != 200:
                    print(f"Error sending results to {callback_url}: {response.status}")

        except Exception as e:
            print(f"Error in handle_subscriber_request: {e}")
            print(f"Error type: {type(e).__name__}")
            import traceback
            print(f"Traceback:\n{traceback.format_exc()}")

            # Notify subscriber of error
            error_payload = self._sign_payload({
                "type": "processing_error",
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e),
                "request_id": request_data.get("request_id")
            })
            await self.session.post(f"{callback_url}/errors", json=error_payload)

    def _sign_payload(self, data: Dict) -> Dict:
        """Sign the payload with the Solana wallet"""
        message = json.dumps(data).encode()
        signature = base58.b58encode(self.keypair.sign(message)).decode()
        return {
            "data": data,
            "signature": signature,
            "pubkey": str(self.keypair.public_key)
        }

    async def make_offer(self, subscriber_url: str) -> bool:
            """Make an offer to a subscriber and handle their immediate response"""
            try:
                print(f"Making offer to {subscriber_url}")
                payload = self._sign_payload({
                    "type": "service_offer",
                    "service": "receipt_processing",
                    "timestamp": datetime.utcnow().isoformat(),
                    "provider": str(self.keypair.public_key),
                    "capabilities": {
                        "receipt_analysis": True,
                        "data_processing": True,
                        "data_storage": True
                    }
                })

                print(f"Making offer to {subscriber_url}")
                async with self.session.post(f"{subscriber_url}/offers", json=payload) as response:
                    if response.status == 200:
                        # If subscriber responds with a request, handle it immediately
                        response_data = await response.json()
                        print(f"Received response from subscriber: {response_data}")

                        if response_data.get('type') == 'receipt_request':
                            # Handle the receipt processing request
                            await self.handle_subscriber_request(
                                request_data=response_data,
                                callback_url=subscriber_url  # or response_data.get('callback_url') if specified
                            )
                        return True
                    else:
                        print(f"Offer not accepted. Status: {response.status}")
                        return False
            except Exception as e:
                print(f"Error making offer to {subscriber_url}: {e}")
                return False


    async def get_provider_subscriptions(self) -> List:
            """Get subscriptions for this provider using SDK HTTP endpoint"""
            try:
                provider_address = str(self.keypair.public_key)
                print(f"Requesting subscriptions for provider: {provider_address}")
                print(f"SDK URL: {self.fxn_sdk_url}")

                async with self.session.get(
                    f"{self.fxn_sdk_url}/subscriptions/provider/{provider_address}"
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        print(f"Received subscriptions: {data}")
                        return data.get('subscriptions', [])
                    else:
                        response_text = await response.text()
                        print(f"Error getting subscriptions. Status: {response.status}")
                        print(f"Response body: {response_text}")
                        return []
            except Exception as e:
                print(f"Error calling FXN SDK: {e}")
                print(f"Error details: {type(e).__name__}")
                # Optional: print full traceback
                import traceback
                print(f"Traceback: {traceback.format_exc()}")
                return []

    async def poll_subscribers_loop(self):
            """Continuous loop to poll subscribers and make offers"""
            while True:
                try:
                    # Get current subscribers from FXN SDK via HTTP
                    subscribers = await self.get_provider_subscriptions()
                    print(f"Active subscribers: {subscribers}")

                    # Make offers to each active subscriber
                    for subscriber in subscribers:
                        if subscriber.get('status') == "active":
                            # Get recipient URL from the nested subscription object
                            recipient_url = subscriber.get('subscription', {}).get('recipient')
                            if recipient_url:
                                await self.make_offer(recipient_url)
                            else:
                                print(f"No recipient URL found for subscriber: {subscriber}")

                    # Wait for next interval
                    await asyncio.sleep(self.OFFER_INTERVAL)

                except Exception as e:
                    print(f"Error in polling loop: {str(e)}")
                    print(f"Error details: {type(e).__name__}")
                    # Optional: print full traceback
                    import traceback
                    print(f"Traceback: {traceback.format_exc()}")
                    await asyncio.sleep(60)  # Wait before retrying on error

    async def start(self):
            """Start the swarm's main loop"""
            try:
                # Initialize session if not already done
                if self.session is None:
                    self.session = aiohttp.ClientSession()
                    print("Initialized aiohttp ClientSession")

                # Start the polling loop
                polling_task = asyncio.create_task(self.poll_subscribers_loop())
                print("Started polling loop")

                # Keep the swarm running
                await polling_task

            except Exception as e:
                print(f"Error in swarm: {e}")
            finally:
                if self.session:
                    await self.session.close()

    async def stop(self):
        """Clean shutdown of the swarm"""
        await self.session.close()

async def main():
    # Load private key from environment
    private_key = os.getenv("WALLET_PRIVATE_KEY")
    if not private_key:
        raise ValueError("WALLET_PRIVATE_KEY environment variable not set")

    # Initialize the swarm
    swarm = BookkeepingSwarm(
        wallet_private_key=private_key
    )

    try:
        # Start the swarm
        await swarm.start()
    except KeyboardInterrupt:
        # Handle graceful shutdown
        await swarm.stop()

if __name__ == "__main__":
    asyncio.run(main())
