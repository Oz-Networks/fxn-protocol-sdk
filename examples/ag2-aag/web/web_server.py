from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import json
from typing import Set
import queue
import asyncio
import os
from pathlib import Path

app = FastAPI()

# Get the absolute path to the directories
BASE_DIR = Path(__file__).resolve().parent.parent
DIST_DIR = BASE_DIR / 'agent-viz' / 'dist'
ASSETS_DIR = DIST_DIR / 'assets'
INDEX_HTML = DIST_DIR / 'index.html'

# Mount the Vite build directory for assets
app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")

active_connections: Set[WebSocket] = set()
message_queue = queue.Queue()
message_history = []
MAX_HISTORY = 10

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """Serve the SPA for all paths."""
    return FileResponse(str(INDEX_HTML))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.add(websocket)
    
    if message_history:
        try:
            await websocket.send_text(json.dumps({
                "current": message_history[-1],
                "history": message_history
            }))
        except Exception as e:
            print(f"Error sending history: {e}")
    
    try:
        while True:
            await websocket.receive_text()
    except Exception as e:
        print(f"WebSocket error: {e}")
        active_connections.remove(websocket)

async def broadcast_messages():
    while True:
        if not message_queue.empty():
            message = message_queue.get()
            if len(message_history) >= MAX_HISTORY:
                message_history.pop(0)
            message_history.append(message)
            
            for connection in list(active_connections):
                try:
                    await connection.send_text(json.dumps({
                        "current": message,
                        "history": message_history
                    }))
                except Exception as e:
                    print(f"Error in broadcast: {e}")
                    active_connections.remove(connection)
        await asyncio.sleep(0.1)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(broadcast_messages())

class WebVisualizer:
    def __init__(self, host="localhost", port=8000):
        self.host = host
        self.port = port
        self._server_thread = None

    def update_agent_status(self, agent_name: str, message: str, thinking: bool = False):
        """Update agent status and add to message queue."""
        print(f"Agent {agent_name}: {message} ({'thinking' if thinking else 'idle'})")
        message_queue.put({
            "agent": agent_name,
            "status": {
                "message": message,
                "isProcessing": thinking
            }
        })

    def start(self):
        """Start the web server in the main thread."""
        print(f"\nStarting visualization server at http://{self.host}:{self.port}")
        print("Open this URL in your browser to see the agent visualization")
        uvicorn.run(app, host=self.host, port=self.port, log_level="error")