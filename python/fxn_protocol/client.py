# python/fxn_protocol/client.py
import requests
import subprocess
import atexit
import time
from typing import Optional, List, Dict, Any
from dataclasses import dataclass

@dataclass
class Subscription:
    end_time: int
    recipient: str
    subscription_pda: str
    status: str

class FXNClient:
    def __init__(self, port: int = 3000, host: str = "localhost"):
        self.base_url = f"http://{host}:{port}"
        self._start_server(port)

    def _start_server(self, port: int):
        # Start the Node.js server
        self.server_process = subprocess.Popen(
            ["node", "server/dist/index.js"],
            env={"PORT": str(port)}
        )
        # Give the server time to start
        time.sleep(1)
        atexit.register(self._stop_server)

    def _stop_server(self):
        if hasattr(self, 'server_process'):
            self.server_process.terminate()

    def subscribe(self, provider: dict, data_provider: str, recipient: str,
                 duration_in_days: int, nft_token_account: str) -> str:
        """Create a new subscription"""
        response = requests.post(f"{self.base_url}/subscribe", json={
            "provider": provider,
            "dataProvider": data_provider,
            "recipient": recipient,
            "durationInDays": duration_in_days,
            "nftTokenAccount": nft_token_account
        })
        response.raise_for_status()
        return response.json()["signature"]

    def renew(self, provider: dict, data_provider: str, new_recipient: str,
              new_end_time: int, quality_score: int, nft_token_account: str) -> str:
        """Renew an existing subscription"""
        response = requests.post(f"{self.base_url}/renew", json={
            "provider": provider,
            "dataProvider": data_provider,
            "newRecipient": new_recipient,
            "newEndTime": new_end_time,
            "qualityScore": quality_score,
            "nftTokenAccount": nft_token_account
        })
        response.raise_for_status()
        return response.json()["signature"]

    def cancel(self, provider: dict, data_provider: str, quality_score: int,
               nft_token_account: Optional[str] = None) -> str:
        """Cancel a subscription"""
        response = requests.post(f"{self.base_url}/cancel", json={
            "provider": provider,
            "dataProvider": data_provider,
            "qualityScore": quality_score,
            "nftTokenAccount": nft_token_account
        })
        response.raise_for_status()
        return response.json()["signature"]

    def get_provider_subscriptions(self, provider: dict, provider_address: str) -> List[Subscription]:
        """Get all subscriptions for a provider"""
        response = requests.get(
            f"{self.base_url}/subscriptions/provider/{provider_address}",
            json={"provider": provider}
        )
        response.raise_for_status()
        return [Subscription(**sub) for sub in response.json()["subscriptions"]]

    def get_user_subscriptions(self, provider: dict, user_address: str) -> List[Subscription]:
        """Get all subscriptions for a user"""
        response = requests.get(
            f"{self.base_url}/subscriptions/user/{user_address}",
            json={"provider": provider}
        )
        response.raise_for_status()
        return [Subscription(**sub) for sub in response.json()["subscriptions"]]

    def set_fee(self, provider: dict, fee: int) -> str:
        """Set the data provider fee"""
        response = requests.post(f"{self.base_url}/fee", json={
            "provider": provider,
            "fee": fee
        })
        response.raise_for_status()
        return response.json()["signature"]
