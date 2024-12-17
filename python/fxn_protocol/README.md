```markdown
# FXN Protocol Python Client

A Python client for interacting with the FXN Protocol. This client provides a simple interface to interact with the FXN Protocol's Solana smart contracts through a local REST server.

## Installation

You can install the package directly from GitHub using pip:

```bash
pip install git+https://github.com/Oz-Networks/fxn-protocol-sdk.git#subdirectory=python
```

## Manual Installation

Alternatively, you can clone the repository and install locally:

# Clone the repository
git clone https://github.com/Oz-Networks/fxn-protocol-sdk.git

# Change to the repository directory
cd fxn-protocol-sdk

# Install the Python package
pip install -e python/

## Prerequisites

Before installing, ensure you have:
- Python 3.7 or higher
- Node.js 14 or higher (required for the local server)
- Git
- 
## Development Setup

For development purposes:

# Clone the repository
git clone https://github.com/Oz-Networks/fxn-protocol-sdk.git

# Change to the repository directory
cd fxn-protocol-sdk

# Install Node.js dependencies
npm install

# Change to the Python package directory
cd python

# Install in editable mode with development dependencies
pip install -e ".[dev]"

## Quick Start

```python
from fxn_protocol import FXNClient

# Initialize the client (automatically starts local server)
client = FXNClient()

# Configure your provider (wallet and connection details)
provider = {
    "connection": your_connection_object,  # Solana connection object
    "wallet": your_wallet_object,         # Solana wallet object
    "opts": {
        "preflightCommitment": "processed"
    }
}

# Create a subscription
signature = client.subscribe(
    provider=provider,
    data_provider="YOUR_DATA_PROVIDER_ADDRESS",
    recipient="RECIPIENT_ADDRESS",
    duration_in_days=30,
    nft_token_account="NFT_TOKEN_ACCOUNT_ADDRESS"
)
```

## Server Management

The FXN Protocol client automatically manages a local server that handles the communication between your Python code and the Solana blockchain.

### Automatic Server Management
By default, the server is automatically:
- Started when you create a new `FXNClient` instance
- Stopped when your Python process ends

```python
# Server starts automatically
client = FXNClient(port=3000)  # default port is 3000

# Server stops automatically when your script ends
```

### Manual Server Management
If you prefer to manage the server manually:

```python
# Start server on a specific port
client = FXNClient(port=3001)

# Manually stop the server
client._stop_server()
```

## API Reference

### Subscriptions

#### Create Subscription
```python
def subscribe(
    self,
    provider: dict,           # Provider configuration with connection and wallet
    data_provider: str,       # Data provider's public key
    recipient: str,           # Recipient's address
    duration_in_days: int,    # Duration of subscription in days
    nft_token_account: str    # NFT token account address
) -> str:                     # Returns transaction signature
    """
    Create a new subscription to a data provider's service.
    
    Args:
        provider: Dictionary containing connection and wallet information
        data_provider: Public key of the data provider
        recipient: Address to receive the subscription
        duration_in_days: How long the subscription should last
        nft_token_account: Address of the NFT token account
    
    Returns:
        Transaction signature as string
    """
```

#### Renew Subscription
```python
def renew(
    self,
    provider: dict,           # Provider configuration
    data_provider: str,       # Data provider's public key
    new_recipient: str,       # New recipient's address
    new_end_time: int,        # New end time for subscription
    quality_score: int,       # Quality score (0-100)
    nft_token_account: str    # NFT token account address
) -> str:                     # Returns transaction signature
    """
    Renew an existing subscription with new parameters.
    
    Args:
        provider: Dictionary containing connection and wallet information
        data_provider: Public key of the data provider
        new_recipient: New address to receive the subscription
        new_end_time: Unix timestamp for new end time
        quality_score: Quality score for the service (0-100)
        nft_token_account: Address of the NFT token account
    
    Returns:
        Transaction signature as string
    """
```

#### Cancel Subscription
```python
def cancel(
    self,
    provider: dict,           # Provider configuration
    data_provider: str,       # Data provider's public key
    quality_score: int,       # Quality score (0-100)
    nft_token_account: Optional[str] = None  # Optional NFT token account
) -> str:                     # Returns transaction signature
    """
    Cancel an existing subscription.
    
    Args:
        provider: Dictionary containing connection and wallet information
        data_provider: Public key of the data provider
        quality_score: Quality score for the service (0-100)
        nft_token_account: Optional address of the NFT token account
    
    Returns:
        Transaction signature as string
    """
```

### Subscription Queries

#### Get Provider Subscriptions
```python
def get_provider_subscriptions(
    self,
    provider: dict,           # Provider configuration
    provider_address: str     # Provider's public key
) -> List[Subscription]:      # Returns list of subscriptions
    """
    Get all subscriptions for a specific provider.
    
    Args:
        provider: Dictionary containing connection and wallet information
        provider_address: Public key of the provider to query
    
    Returns:
        List of Subscription objects containing:
        - end_time: Unix timestamp when subscription ends
        - recipient: Recipient's address
        - subscription_pda: Subscription's PDA
        - status: Current status ('active', 'expired', or 'expiring_soon')
    """
```

#### Get User Subscriptions
```python
def get_user_subscriptions(
    self,
    provider: dict,           # Provider configuration
    user_address: str         # User's public key
) -> List[Subscription]:      # Returns list of subscriptions
    """
    Get all subscriptions for a specific user.
    
    Args:
        provider: Dictionary containing connection and wallet information
        user_address: Public key of the user to query
    
    Returns:
        List of Subscription objects
    """
```

### Fee Management

#### Set Provider Fee
```python
def set_fee(
    self,
    provider: dict,           # Provider configuration
    fee: int                  # New fee amount
) -> str:                     # Returns transaction signature
    """
    Set the data provider's fee.
    
    Args:
        provider: Dictionary containing connection and wallet information
        fee: New fee amount in lamports
    
    Returns:
        Transaction signature as string
    """
```

## Provider Configuration

The provider configuration dictionary should contain:

```python
provider = {
    "connection": {
        # Solana connection object
        # Usually created with web3.Connection
    },
    "wallet": {
        # Wallet object containing the keypair
        # Usually created with web3.Keypair
    },
    "opts": {
        "preflightCommitment": "processed"  # or other commitment level
    }
}
```

## Error Handling

The client will raise exceptions in the following cases:
- `ConnectionError`: When unable to connect to the local server
- `RequestException`: When the server returns an error
- `ValueError`: When invalid parameters are provided
- HTTP exceptions (400, 500, etc.) for various API errors

Example error handling:

```python
from fxn_protocol import FXNClient
from requests.exceptions import RequestException

client = FXNClient()

try:
    signature = client.subscribe(...)
except RequestException as e:
    print(f"Error making request: {e}")
except ValueError as e:
    print(f"Invalid parameters: {e}")
```

## Development

To contribute to this project:

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run tests:
   ```bash
   pytest
   ```

### Testing and local use

## Server Usage

### Running the Server Directly with Node

```bash
# From the repository root
npm install        # Install dependencies
npm run build     # Build TypeScript files
node server/dist/index.js
```

The server will start on port 3000 by default. You can specify a different port using the PORT
```
PORT=3001 node server/dist/index.js
```

## API Examples Using curl

Below are examples of how to interact with the server directly using curl. These examples assume the server is running on localhost:3000.

# Create Subscription
```
curl -X POST http://localhost:3000/subscribe \
-H "Content-Type: application/json" \
-d '{
"provider": {
"connection": {},
"wallet": {},
"opts": {"preflightCommitment": "processed"}
},
"dataProvider": "YOUR_DATA_PROVIDER_PUBLIC_KEY",
"recipient": "RECIPIENT_ADDRESS",
"durationInDays": 30,
"nftTokenAccount": "NFT_TOKEN_ACCOUNT_ADDRESS"
}'
```

# Renew Subscription
```
curl -X POST http://localhost:3000/renew \
  -H "Content-Type: application/json" \
  -d '{
    "provider": {
      "connection": {},
      "wallet": {},
      "opts": {"preflightCommitment": "processed"}
    },
    "dataProvider": "DATA_PROVIDER_PUBLIC_KEY",
    "newRecipient": "NEW_RECIPIENT_ADDRESS",
    "newEndTime": 1703980800,
    "qualityScore": 95,
    "nftTokenAccount": "NFT_TOKEN_ACCOUNT_ADDRESS"
  }'
```

# Cancel Subscription
```
curl -X POST http://localhost:3000/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "provider": {
      "connection": {},
      "wallet": {},
      "opts": {"preflightCommitment": "processed"}
    },
    "dataProvider": "DATA_PROVIDER_PUBLIC_KEY",
    "qualityScore": 90,
    "nftTokenAccount": "NFT_TOKEN_ACCOUNT_ADDRESS"
  }'
```

# Get Provider Subscriptions
```
curl -X GET http://localhost:3000/subscriptions/provider/PROVIDER_PUBLIC_KEY \
  -H "Content-Type: application/json" \
  -d '{
    "provider": {
      "connection": {},
      "wallet": {},
      "opts": {"preflightCommitment": "processed"}
    }
  }'
```

# Get User Subscriptions
```
curl -X GET http://localhost:3000/subscriptions/user/USER_PUBLIC_KEY \
  -H "Content-Type: application/json" \
  -d '{
    "provider": {
      "connection": {},
      "wallet": {},
      "opts": {"preflightCommitment": "processed"}
    }
  }'
  ```

# Set Provider Fee
```
curl -X POST http://localhost:3000/fee \
  -H "Content-Type: application/json" \
  -d '{
    "provider": {
      "connection": {},
      "wallet": {},
      "opts": {"preflightCommitment": "processed"}
    },
    "fee": 1000000
  }'
```

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).

The GPL-3.0 license ensures that:
- The software can be freely used, modified, and distributed
- Any modifications or software that includes this code must also be released under the GPL-3.0
- Source code must be made available when the software is distributed
- Changes made to the code must be documented

For more information about the GPL-3.0 license, visit: https://www.gnu.org/licenses/gpl-3.0.en.html
