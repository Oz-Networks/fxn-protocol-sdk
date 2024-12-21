#!/bin/bash
# run.sh

# Build and start the containers
docker-compose up --build -d

# Wait for the FXN SDK server to start
echo "Waiting for FXN SDK server to start..."
sleep 10

# Follow the logs
docker-compose logs -f
