# VeilPay Relayer API Documentation

## Base URL

```
http://localhost:3001  (development)
```

## Endpoints

### Health Check

**GET** `/health`

Check if the relayer is running.

**Response**
```json
{
  "status": "ok",
  "service": "veilpay-relayer"
}
```

---

### Get Current Merkle Root

**GET** `/root`

Get the current Merkle root of all deposits.

**Response**
```json
{
  "root": "0x1234567890abcdef..."
}
```

---

### Get Merkle Proof

**GET** `/proof/:commitment`

Get the Merkle proof for a specific commitment.

**Parameters**
- `commitment` (string): The commitment hash (hex)

**Response**
```json
{
  "proof": {
    "pathElements": ["0x1234...", "0x5678...", ...],
    "pathIndices": [0, 1, 0, ...],
    "root": "0xabcd...",
    "leaf": "0x9876..."
  }
}
```

---

### Submit Withdrawal

**POST** `/withdraw`

Submit a withdrawal request with ZK proof.

**Request Body**
```json
{
  "proof": { /* Groth16 proof object */ },
  "publicSignals": ["root", "nullifierHash", "recipient"],
  "nullifierHash": "0x1234...",
  "recipient": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  "amount": "1000000",
  "root": "0xabcd..."
}
```

**Response**
```json
{
  "success": true,
  "txid": "0x789abc...",
  "message": "Withdrawal submitted successfully"
}
```

---

### Get Relayer Stats

**GET** `/stats`

Get statistics about the relayer and pool.

**Response**
```json
{
  "totalDeposits": 156,
  "currentRoot": "0x1234...",
  "relayerAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid proof or parameters |
| 404  | Not Found - Commitment not found |
| 500  | Internal Server Error |

---

## Client Example

```javascript
import axios from 'axios';

const relayer = axios.create({
  baseURL: 'http://localhost:3001'
});

// Get merkle proof
const { data } = await relayer.get(`/proof/${commitment}`);

// Submit withdrawal
await relayer.post('/withdraw', {
  proof,
  publicSignals,
  nullifierHash,
  recipient,
  amount,
  root
});
```
