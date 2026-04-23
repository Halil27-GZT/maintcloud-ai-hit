#!/bin/sh
set -eu

CERT_DIR="/etc/nginx/certs"
CERT_FILE="$CERT_DIR/maintcloud.crt"
KEY_FILE="$CERT_DIR/maintcloud.key"
SERVER_NAME="${SERVER_NAME:-localhost}"

mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
    openssl req -x509 -nodes -newkey rsa:2048 \
        -keyout "$KEY_FILE" \
        -out "$CERT_FILE" \
        -days 365 \
        -subj "/CN=$SERVER_NAME"
fi
