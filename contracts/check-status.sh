#!/bin/bash

TXID="479c81a7a544e2d76d29ceda442b6a2c99582539d6b67c1553d5bc78b4d01bec"

echo "Monitoreando confirmación del contrato veilpay..."
echo "TX ID: $TXID"
echo ""

while true; do
    STATUS=$(curl -s "https://api.testnet.hiro.so/extended/v1/tx/$TXID" | jq -r '.tx_status // "pending"')
    echo "$(date +%H:%M:%S) - Estado: $STATUS"

    if [ "$STATUS" = "success" ]; then
        echo "✅ Contrato confirmado!"
        break
    elif [ "$STATUS" = "abort_by_response" ] || [ "$STATUS" = "abort_by_post_condition" ]; then
        echo "❌ Transacción falló: $STATUS"
        break
    fi

    sleep 10
done
