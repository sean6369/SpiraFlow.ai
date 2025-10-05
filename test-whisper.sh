#!/bin/bash

# Test script to verify Whisper API connectivity
# This helps isolate whether the issue is with Node.js or the network

echo "Testing OpenAI Whisper API connectivity..."
echo ""

# Read API key from .env.local
API_KEY=$(grep OPENAI_API_KEY .env.local | cut -d '=' -f2 | tr -d ' ')

if [ -z "$API_KEY" ]; then
    echo "Error: Could not find OPENAI_API_KEY in .env.local"
    exit 1
fi

echo "API Key found: ${API_KEY:0:10}..."
echo ""

# Create a test audio file (1 second of silence)
echo "Creating test audio file..."
# Use ffmpeg if available, otherwise skip
if command -v ffmpeg &> /dev/null; then
    ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libopus test-audio.opus -y 2>/dev/null
    TEST_FILE="test-audio.opus"
    echo "Created test-audio.opus"
elif command -v sox &> /dev/null; then
    sox -n -r 44100 -c 1 test-audio.wav trim 0 1
    TEST_FILE="test-audio.wav"
    echo "Created test-audio.wav"
else
    echo "Neither ffmpeg nor sox found. Please install one to create test audio."
    echo ""
    echo "Install ffmpeg: brew install ffmpeg"
    echo "Or install sox: brew install sox"
    exit 1
fi

echo ""
echo "Testing Whisper API with curl..."
echo "This should complete in 5-10 seconds..."
echo ""

# Test the API
curl -X POST https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F file="@$TEST_FILE" \
  -F model="whisper-1" \
  --max-time 30 \
  --connect-timeout 10 \
  -w "\n\nHTTP Status: %{http_code}\nTime Total: %{time_total}s\n"

echo ""
echo "If you see a transcription above, your network connection to Whisper API is working!"
echo "If you see a timeout or connection error, there's a network/firewall issue."

# Cleanup
rm -f $TEST_FILE

