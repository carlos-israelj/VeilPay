#!/bin/bash
set -e

CIRCUIT_NAME="withdraw"
BUILD_DIR="./build"
PTAU_FILE="powersOfTau28_hez_final_14.ptau"

# Create build directory
mkdir -p $BUILD_DIR

echo "Compiling circuit..."
circom ${CIRCUIT_NAME}.circom --r1cs --wasm --sym -o $BUILD_DIR -l ../node_modules

# Download powers of tau if not exists
if [ ! -f $BUILD_DIR/$PTAU_FILE ]; then
    echo "Downloading powers of tau..."
    wget -P $BUILD_DIR https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau || \
    wget -P $BUILD_DIR https://storage.googleapis.com/zkevm/powersOfTau28_hez_final_14.ptau || \
    curl -o $BUILD_DIR/$PTAU_FILE https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau || \
    echo "Failed to download Powers of Tau. Please download manually from https://github.com/iden3/snarkjs#7-prepare-phase-2"
fi

echo "Generating zkey (trusted setup)..."
snarkjs groth16 setup $BUILD_DIR/${CIRCUIT_NAME}.r1cs $BUILD_DIR/$PTAU_FILE $BUILD_DIR/${CIRCUIT_NAME}_0000.zkey

echo "Contributing to phase 2 ceremony..."
snarkjs zkey contribute $BUILD_DIR/${CIRCUIT_NAME}_0000.zkey $BUILD_DIR/${CIRCUIT_NAME}_final.zkey --name="1st Contributor" -v -e="random entropy"

echo "Exporting verification key..."
snarkjs zkey export verificationkey $BUILD_DIR/${CIRCUIT_NAME}_final.zkey $BUILD_DIR/verification_key.json

echo "Build complete!"
echo "Artifacts in $BUILD_DIR:"
ls -lh $BUILD_DIR
