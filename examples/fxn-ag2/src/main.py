# src/main.py
import os
import asyncio
import signal
from dotenv import load_dotenv
from pathlib import Path
from src.bookkeeping_swarm import BookkeepingSwarm

# Load .env file
load_dotenv()

async def main():
    # Validate required environment variables
    wallet_private_key = os.getenv("SOLANA_PRIVATE_KEY")
    if not wallet_private_key:
        raise ValueError("SOLANA_PRIVATE_KEY not found in environment variables")

    # Initialize the swarm
    swarm = BookkeepingSwarm(
        wallet_private_key=wallet_private_key,
        port=int(os.getenv("FXN_SDK_PORT", "3000"))
    )

    # Setup graceful shutdown
    loop = asyncio.get_running_loop()
    stop_event = asyncio.Event()

    def signal_handler():
        print("\nShutdown signal received. Cleaning up...")
        stop_event.set()

    # Register signal handlers
    for sig in (signal.SIGINT, signal.SIGTERM):
        asyncio.get_running_loop().add_signal_handler(sig, signal_handler)

    try:
        # Create task for the polling loop
        polling_task = asyncio.create_task(swarm.poll_subscribers_loop())

        # Wait for shutdown signal
        await stop_event.wait()

        # Cancel the polling task
        polling_task.cancel()
        try:
            await polling_task
        except asyncio.CancelledError:
            pass

    finally:
        # Ensure cleanup happens
        await swarm.stop()
        print("Shutdown complete")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nProcess interrupted by user")
