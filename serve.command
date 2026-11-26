#!/bin/zsh
cd "$(dirname "$0")" || exit 1

PORT=8000
while lsof -i :$PORT >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

echo "Kasey CV · http://localhost:$PORT/index.html"
echo "按 Ctrl+C 结束预览"

python3 -m http.server $PORT >/dev/null 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null' EXIT
sleep 1
open "http://localhost:$PORT/index.html"
wait $SERVER_PID
