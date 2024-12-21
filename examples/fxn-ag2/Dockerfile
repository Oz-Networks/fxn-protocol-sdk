# Dockerfile
FROM python:3.10-slim

# Install Node.js for the FXN protocol SDK
RUN apt-get update && apt-get install -y \
    git \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy FXN protocol SDK and install dependencies
COPY fxn-protocol-sdk /app/fxn-protocol-sdk
WORKDIR /app/fxn-protocol-sdk
RUN npm install
RUN npm run build

# Back to app directory
WORKDIR /app

# Copy Python requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ /app/src/

# Copy .env file
COPY .env .

# Expose port for FXN client
EXPOSE 3000

# Start the application
CMD ["python", "-m", "src.main"]
