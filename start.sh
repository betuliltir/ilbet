#!/bin/bash

# Start the backend server
echo "Starting backend server..."
./backend/start.sh &

# Wait for the backend to start
echo "Waiting for backend to start..."
sleep 10

# Start the frontend server
echo "Starting frontend server..."
./frontend/start.sh 