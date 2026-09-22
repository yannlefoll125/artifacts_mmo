#!/usr/bin/env bash

curl "localhost:3000${1}" | jq . | tee /home/yann/.config/JetBrains/IntelliJIdea2026.2/scratches/scratch.json
echo ""
