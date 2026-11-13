#!/usr/bin/env bash
# Start the TOUCHLINE store locally: http://localhost:8080
cd "$(dirname "$0")"
echo "TOUCHLINE running at http://localhost:8080  (Ctrl+C to stop)"
python3 -m http.server 8080
