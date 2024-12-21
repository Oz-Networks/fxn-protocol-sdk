# FXN Protocol + AutoGen Integration Example

This repository demonstrates an integration between the [FXN Protocol](https://fxn.world) and [AutoGen](https://microsoft.github.io/autogen/) (AG2), showcasing how to create an AI agent swarm that processes receipts for subscribed users.

## Overview

This example implements a bookkeeping swarm that:
1. Connects to the FXN Protocol to manage subscriptions
2. Uses AutoGen's multi-agent system to process receipt images
3. Demonstrates provider-subscriber communication patterns
4. Shows how to handle async workflows with Python and TypeScript

### Components

- **FXN Protocol SDK**: Handles subscription management and provider-subscriber communication
- **AutoGen Agents**:
  - `image_analyzer`: Processes receipt images using GPT-4V
  - `data_processor`: Standardizes and categorizes receipt data
  - `spreadsheet_manager`: Prepares data for storage

## Prerequisites

- Python 3.10+
- Node.js 22+
- Docker and Docker Compose (optional)

## Installation

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fxn-ag2.git
cd fxn-ag2
```

2. Create a `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key
SOLANA_PRIVATE_KEY=your_solana_private_key
FXN_SDK_PORT=3000
AUTOGEN_USE_DOCKER=False
```

3. Run with Docker:
```bash
chmod +x run.sh
./run.sh
```

### Local Development Setup

1. Install Python dependencies:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. Install FXN SDK dependencies:
```bash
cd fxn-protocol-sdk
npm install
npm run build:server
```

3. Run the services:

Terminal 1 (FXN SDK Server):
```bash
cd fxn-protocol-sdk
npm run start
```

Terminal 2 (Bookkeeping Swarm):
```bash
source venv/bin/activate
python -m src.main
```

## Development

### Running Tests

Install development dependencies:
```bash
pip install -r requirements-dev.txt
```

Run tests:
```bash
pytest -v tests/ --log-cli-level=DEBUG
```

## How It Works

1. The swarm runs as a FXN Protocol provider, polling for active subscribers
2. When a subscriber is found, the swarm makes an offer to process receipts
3. Subscribers can respond with receipt processing requests
4. The AutoGen agent swarm processes the receipt:
    - Analyzes the receipt image using GPT-4V
    - Extracts and standardizes the data
    - Prepares the data for storage
5. Results are sent back to the subscriber

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌────────────────┐
│  FXN Protocol   │←────│ Bookkeeping  │────→│ AutoGen Agents │
│     Server      │     │    Swarm     │     │                │
└─────────────────┘     └──────────────┘     └────────────────┘
         ↑                     ↓
         │                     │
         └─────────────────────┘
         Subscriber Communication
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT license.

## Notes

This is an example integration and may need additional security and error handling for production use. It demonstrates basic concepts of:
- FXN Protocol subscription management
- AutoGen multi-agent systems
- Async Python with aiohttp
- TypeScript/Node.js services
- Docker containerization

For more information:
- [FXN Protocol Documentation](https://fxn.world)
- [AutoGen Documentation](https://microsoft.github.io/autogen/)
