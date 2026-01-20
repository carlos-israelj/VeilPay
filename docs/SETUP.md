# VeilPay Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Circom 2.0+
- Clarinet (for Clarity development)
- Stacks wallet (Leather, Hiro, etc.)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/carlos-israelj/VeilPay.git
cd VeilPay
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install circuit dependencies
cd circuits && npm install && cd ..

# Install relayer dependencies
cd relayer && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Install Circom

```bash
# On Linux/macOS
curl -L https://github.com/iden3/circom/releases/latest/download/circom-linux-amd64 -o /usr/local/bin/circom
chmod +x /usr/local/bin/circom

# Verify installation
circom --version
```

### 4. Build the Circuits

```bash
cd circuits
chmod +x scripts/build.sh
./scripts/build.sh
```

This will compile the circuit and generate proving keys (~10-15 minutes).

### 5. Deploy the Clarity Contract

```bash
cd contracts
clarinet test
clarinet deploy --testnet
```

### 6. Configure the Relayer

```bash
cd relayer
cp .env.example .env
# Edit .env with your contract address and relayer private key
```

### 7. Configure the Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env with your contract address
```

### 8. Copy Circuit Artifacts

```bash
mkdir -p frontend/public/circuits
cp circuits/build/withdraw.wasm frontend/public/circuits/
cp circuits/build/withdraw_final.zkey frontend/public/circuits/
cp circuits/build/verification_key.json frontend/public/circuits/
```

## Running the System

### Terminal 1: Start Relayer

```bash
cd relayer
npm run dev
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

### Terminal 3: Initialize Contract

```bash
clarinet console
(contract-call? .veilpay initialize 0x<relayer-public-key>)
```

## Testing

```bash
# Test circuits
cd circuits && npm test

# Test relayer
cd relayer && npm test

# Test contracts
cd contracts && clarinet test
```

## Troubleshooting

See full troubleshooting guide in the documentation.
