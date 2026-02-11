#!/bin/bash

# VeilPay Bot Marketplace - Production Testing Script
# Tests all 4 AI bot endpoints on production relayer

RELAYER_URL="https://veilpay-x402-relayer.onrender.com"

echo "🤖 Testing VeilPay Bot Marketplace on Production"
echo "================================================"
echo ""

echo "1️⃣  Testing Security Bot..."
echo "---"
curl -X POST "$RELAYER_URL/x402/bots/security/audit" \
  -H "Content-Type: application/json" \
  -d '{
    "contractAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "contractName": "veilpay",
    "fullAnalysis": true
  }' | jq '.'
echo ""
echo ""

echo "2️⃣  Testing Tokenomics Bot..."
echo "---"
curl -X POST "$RELAYER_URL/x402/bots/tokenomics/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "contractAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "contractName": "veilpay",
    "tokenSymbol": "VEIL"
  }' | jq '.'
echo ""
echo ""

echo "3️⃣  Testing Sentiment Bot..."
echo "---"
curl -X POST "$RELAYER_URL/x402/bots/sentiment/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "VeilPay",
    "contractAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "contractName": "veilpay",
    "tokenSymbol": "VEIL",
    "githubUrl": "https://github.com/carlos-israelj/VeilPay"
  }' | jq '.'
echo ""
echo ""

echo "4️⃣  Testing Coordinator Bot (Full Analysis)..."
echo "---"
curl -X POST "$RELAYER_URL/x402/bots/coordinator/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "VeilPay",
    "contractAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "contractName": "veilpay",
    "tokenSymbol": "VEIL",
    "githubUrl": "https://github.com/carlos-israelj/VeilPay"
  }' | jq '.'
echo ""
echo ""

echo "✅ Bot testing complete!"
