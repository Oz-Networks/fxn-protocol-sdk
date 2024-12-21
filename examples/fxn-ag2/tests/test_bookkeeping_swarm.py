# tests/test_bookkeeping_swarm.py
import pytest
import asyncio
import json
from unittest.mock import Mock, patch
from aiohttp import web
from aioresponses import aioresponses

import os
import sys
import logging

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.bookkeeping_swarm import BookkeepingSwarm

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@pytest.fixture
def test_private_key():
    return "3BPYUArrXm47rbCkvfHuzhNGPaFWw8hfkceqRk71MczarcJtriFCtUkToVJvnqnYG9StNUd4rh2eL1iyDJDBrW5Z"

@pytest.fixture
def test_public_key():
    return "FudyA8LVVCuJqd4NdPgTpwuqXXNeN2uP2HvteVhcLrew"

@pytest.fixture(autouse=True)
def mock_env():
    with patch.dict('os.environ', {
        'OPENAI_API_KEY': 'test-key',
        'AUTOGEN_USE_DOCKER': 'False'
    }):
        yield

@pytest.mark.asyncio
async def test_make_offer_with_receipt_request(test_private_key):
    """Test making an offer and handling an immediate receipt request"""
    with aioresponses() as m:
        subscriber_url = "http://localhost:3005"

        logger.info(f"Setting up mock for {subscriber_url}/offers")

        # Mock subscriber response to offer
        m.post(
            f"{subscriber_url}/offers",
            status=200,
            payload={
                "type": "receipt_request",
                "image_url": "https://example.com/receipt.jpg",
                "request_id": "test-request-1",
                "callback_url": subscriber_url
            },
            repeat=True  # Allow multiple calls
        )

        # Mock the results endpoint
        m.post(
            f"{subscriber_url}/results",
            status=200,
            payload={"status": "success"},
            repeat=True
        )

        # Mock autogen responses for receipt processing
        mock_summary = {
            "date": "2024-01-21",
            "amount": 42.99,
            "merchant": "Test Store",
            "category": "Test Category"
        }

        with patch('autogen.GroupChatManager.a_initiate_chat') as mock_chat:
            mock_chat.return_value = Mock(summary=mock_summary)

            swarm = BookkeepingSwarm(
                        wallet_private_key=test_private_key,
                        port=3000,
                        offer_interval=1  # Short interval for testing
                    )
            try:
                logger.info("Making offer to subscriber")
                result = await swarm.make_offer(subscriber_url)

                # Log the requests that were made
                logger.info(f"Requests made: {m.requests}")

                assert result is True, "make_offer should return True for successful offer"
            finally:
                await swarm.stop()

@pytest.mark.asyncio
async def test_handle_receipt_processing(test_private_key):
    """Test the complete receipt processing flow"""
    with aioresponses() as m:
        subscriber_url = "http://localhost:3005"
        request_data = {
            "type": "receipt_request",
            "image_url": "https://example.com/receipt.jpg",
            "request_id": "test-request-1"
        }

        print("\n=== Setting up test mocks ===")

        # Mock the results endpoint
        m.post(
            f"{subscriber_url}/results",
            status=200,
            payload={"status": "success"},
            repeat=True
        )
        print(f"Mocked POST endpoint: {subscriber_url}/results")

        # Create mock response for autogen
        mock_summary = {
            "date": "2024-01-21",
            "amount": 42.99,
            "merchant": "Test Store",
            "category": "Test Category"
        }

        async def async_mock_chat(*args, **kwargs):
            print(f"Mock autogen chat called with agent: {args[0].name if args else 'unknown'}")
            return Mock(summary=mock_summary)

        with patch('autogen.GroupChatManager.a_initiate_chat', new=async_mock_chat):
            print("\n=== Initializing BookkeepingSwarm ===")
            swarm = BookkeepingSwarm(
                wallet_private_key=test_private_key,
                port=3000,
                offer_interval=1
            )

            try:
                print("\n=== Starting test execution ===")

                # Initialize the session
                if swarm.session is None:
                    swarm.session = aiohttp.ClientSession()
                    print("Initialized aiohttp session")

                print(f"Calling handle_subscriber_request with data: {request_data}")
                await swarm.handle_subscriber_request(request_data, subscriber_url)

                # Add a small delay to ensure async operations complete
                await asyncio.sleep(0.1)

                print("\n=== Checking requests ===")
                requests_made = [(method, str(url)) for method, url in m.requests.keys()]
                print(f"All requests made: {requests_made}")

                results_requests = [req for req in requests_made
                                  if req[1] == f'{subscriber_url}/results']

                print(f"Results requests found: {results_requests}")

                # Check the actual request data if any requests were made
                for method, url in m.requests.keys():
                    request_info = m.requests[(method, url)][0]
                    print(f"\nRequest details for {method} {url}:")
                    print(f"Headers: {request_info.kwargs.get('headers', {})}")
                    print(f"Data: {request_info.kwargs.get('data', '')}")

                assert len(results_requests) > 0, f"No requests were made to the results endpoint. All requests: {requests_made}"

            except Exception as e:
                print(f"\n=== Test Error ===")
                print(f"Error: {str(e)}")
                print(f"Error type: {type(e)}")
                import traceback
                print(f"Traceback:\n{traceback.format_exc()}")
                raise
            finally:
                print("\n=== Cleanup ===")
                await swarm.stop()

@pytest.mark.asyncio
async def test_full_workflow(test_private_key, test_public_key):
    """Test the complete workflow from subscription to processing"""
    with aioresponses() as m:
        # Mock FXN SDK subscriptions endpoint
        sdk_url = f"http://localhost:3000/subscriptions/provider/{test_public_key}"
        subscriber_url = "http://localhost:3005"

        # Add debug logging
        print(f"\n=== Setting up test ===")
        print(f"SDK URL: {sdk_url}")
        print(f"Subscriber URL: {subscriber_url}")

        # Mock subscriptions endpoint
        m.get(
            sdk_url,
            status=200,
            payload={
                "success": True,
                "subscriptions": [
                    {
                        "subscriber": "test-subscriber",
                        "subscriptionPDA": "test-pda",
                        "subscription": {
                            "endTime": "67b290c4",
                            "recipient": subscriber_url
                        },
                        "status": "active"
                    }
                ]
            },
            repeat=True
        )

        # Mock subscriber endpoints
        m.post(
            f"{subscriber_url}/offers",
            status=200,
            payload={
                "type": "receipt_request",
                "image_url": "https://example.com/receipt.jpg",
                "request_id": "test-request-1"
            },
            repeat=True
        )

        m.post(
            f"{subscriber_url}/results",
            status=200,
            payload={"status": "success"},
            repeat=True
        )

        # Create mock response for autogen
        mock_summary = {
            "date": "2024-01-21",
            "amount": 42.99,
            "merchant": "Test Store",
            "category": "Test Category"
        }

        async def async_mock_chat(*args, **kwargs):
            return Mock(summary=mock_summary)

        with patch('autogen.GroupChatManager.a_initiate_chat', new=async_mock_chat):
            print("\n=== Initializing swarm ===")
            swarm = BookkeepingSwarm(
                wallet_private_key=test_private_key,
                port=3000,
                offer_interval=1  # Short interval for testing
            )

            try:
                print("\n=== Starting test execution ===")

                # Start the polling loop
                polling_task = asyncio.create_task(swarm.poll_subscribers_loop())

                # Give time for the polling to occur
                print("Waiting for polling loop to execute...")
                for i in range(3):  # Try for 3 intervals
                    await asyncio.sleep(1.5)  # Wait 1.5 seconds each time
                    print(f"\nCheck {i + 1} - Checking requests...")

                    # Get all requests made
                    requests_made = [(method, str(url)) for method, url in m.requests.keys()]
                    print(f"Current requests made: {requests_made}")

                    # Check for SDK requests
                    sdk_requests = [req for req in requests_made if sdk_url in req[1]]
                    if sdk_requests:
                        print(f"Found SDK requests: {sdk_requests}")
                        break

                print("\n=== Final Verification ===")
                requests_made = [(method, str(url)) for method, url in m.requests.keys()]
                print(f"All requests made: {requests_made}")

                # Verify SDK requests - use 'in' instead of exact match
                sdk_requests = [req for req in requests_made if sdk_url in req[1]]
                assert len(sdk_requests) > 0, (
                    f"No requests made to SDK endpoint.\n"
                    f"Expected URL: {sdk_url}\n"
                    f"All requests: {requests_made}"
                )

                # Verify offer requests
                offer_requests = [req for req in requests_made
                                if f"{subscriber_url}/offers" in req[1]]
                assert len(offer_requests) > 0, (
                    f"No offers made to subscriber.\n"
                    f"Expected URL: {subscriber_url}/offers\n"
                    f"All requests: {requests_made}"
                )

            finally:
                print("\n=== Cleanup ===")
                # Cancel the polling task
                polling_task.cancel()
                try:
                    await polling_task
                except asyncio.CancelledError:
                    pass
                await swarm.stop()
