# Multi-Agent System with FXN Agent Discovery

This project implements a multi-agent system that includes a reasoning agent, FXN discovery agent, and user proxy agent. It has a visualizer to display interactions between agents

## Project Structure

```
your_project_root/
├── web/
│   ├── templates/
│   ├── static/
│   └── web_server.py
├── agent_network.py
├── agent_visualizer.py
├── enhanced_reasoning_agent.py
└── requirements.txt
```

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Oz-Networks/fxn-protocol-sdk
cd fxn-protocol-sdk/examples/ag2-aag
```

2. Create and activate a virtual environment (recommended):
```bash
# On macOS/Linux
python -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
.\venv\Scripts\activate
```

3. Install the required packages:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the project root and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

## Project Setup

1. Build the visualizer (optional - for local testing). Node >=23 recommended.
```bash
cd ./agent-viz
npm install
npm run build
```

2. Create the necessary files with the provided code:
- `web/web_server.py`: Contains the web visualization server
- `agent_network.py`: Implements the expert finder agent
- `enhanced_reasoning_agent.py`: Main agent orchestration
- `requirements.txt`: Project dependencies

## Running the Application

1. Start the application:
```bash
python enhanced_reasoning_agent.py
```

2. Open your web browser and navigate to:
```
http://localhost:8000
```

3. You should see the agent visualization interface showing three agents:
- User Proxy
- Reasoning Agent
- FXN (Expert Finder)

The visualization will update in real-time as the agents process information and interact with each other.

## Features

- Real-time visualization of agent states
- Web-based interface using React
- WebSocket communication for live updates
- SVG-based agent representations
- Processing state indicators
- Configurable processing delays for better visualization

## Development

To modify the visualization:
1. Edit the React component in `web/web_server.py`
2. Adjust the processing delay in `enhanced_reasoning_agent.py` by modifying `self.VISUALIZATION_DELAY`
3. Modify agent behaviors in their respective files

## Troubleshooting

1. If you see "No module named 'xxx'" errors:
   - Ensure you've activated your virtual environment
   - Run `pip install -r requirements.txt` again

2. If the visualization doesn't update:
   - Check the browser console for WebSocket errors
   - Ensure no other service is using port 8000
   - Verify your browser supports WebSocket connections

3. If agents stop responding:
   - Check your OpenAI API key is valid
   - Verify your internet connection
   - Check the Python console for error messages

## License

MIT

## Contributing

Feel free to submit a PR enhancing or extending any example in the sdk