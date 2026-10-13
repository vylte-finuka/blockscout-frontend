#!/bin/sh
# Definitive bind — Next standalone uses process.env.PORT || 3000
export PORT=3010
export HOSTNAME=0.0.0.0
echo "start-next: binding ${HOSTNAME}:${PORT}"
exec node server.js
