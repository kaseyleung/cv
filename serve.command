#!/bin/zsh
cd "$(dirname "$0")" || exit 1
PORT=8000
echo "Serving CV at http://localhost:$PORT/index.html"
python3 -m http.server $PORT &
SERVER_PID=$!
sleep 1
open "http://localhost:$PORT/index.html"
wait $SERVER_PID
