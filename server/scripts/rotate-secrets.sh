#!/bin/bash
# Rotate secrets for transit adapter (example: k8s)
# Usage: ./rotate-secrets.sh <key> <new_value>

set -e
KEY="$1"
NEW_VALUE="$2"
SECRET_NAME="transit-adapter-secrets"
NAMESPACE="default"

if [[ -z "$KEY" || -z "$NEW_VALUE" ]]; then
  echo "Usage: $0 <key> <new_value>"
  exit 1
fi

echo "Rotating $KEY in $SECRET_NAME..."
kubectl patch secret "$SECRET_NAME" -n "$NAMESPACE" \
  --type='json' \
  -p="[{\"op\":\"replace\",\"path\":\"/stringData/$KEY\",\"value\":\"$NEW_VALUE\"}]"
echo "Secret $KEY rotated. Restart affected pods to pick up changes."
