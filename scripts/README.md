# Earth 2089 Utility Scripts

This directory contains standalone utility scripts for development, testing, and setup purposes.

## Scripts

### `mint-earth-token.js`
**Purpose:** Creates the EARTH token mint on Solana devnet and mints initial supply.

**Usage:**
```bash
cd scripts
node mint-earth-token.js
```

**What it does:**
- Creates EARTH token mint with 9 decimals
- Mints 3.5M EARTH tokens to server wallet
- Outputs mint address for environment variables
- Provides Solana Explorer links

**Requirements:**
- `SERVER_KEYPAIR_SECRET` environment variable
- Sufficient SOL for transaction fees

---

### `mint-usdc.js`
**Purpose:** Creates a test USDC token for development/testing.

**Usage:**
```bash
cd scripts
node mint-usdc.js
```

**What it does:**
- Creates test USDC mint with 6 decimals
- Mints 1000 test tokens to server wallet
- Outputs mint address for testing

**Requirements:**
- `SERVER_KEYPAIR_SECRET` environment variable
- Sufficient SOL for transaction fees

---

### `airdrop.js`
**Purpose:** Airdrops tokens/SOL to a predefined list of wallets for testing.

**Usage:**
```bash
cd scripts
node airdrop.js
```

**What it does:**
- Airdrops tokens to hardcoded wallet addresses
- Used for development/testing purposes
- Distributes tokens to multiple test accounts

**Requirements:**
- `SERVER_KEYPAIR_SECRET` environment variable
- Sufficient SOL and tokens for distribution

---

## Environment Setup

All scripts require the following environment variable:

```bash
# Server wallet private key as JSON array
SERVER_KEYPAIR_SECRET=[1,2,3,...,64]
```

## Notes

- These are **one-time setup/utility scripts**, not part of the main application
- Scripts are designed for **devnet** testing
- Ensure adequate SOL balance before running scripts
- Scripts output important addresses that may need to be added to environment variables

## Running Scripts

1. **Navigate to scripts directory:**
   ```bash
   cd scripts
   ```

2. **Ensure environment variables are set:**
   ```bash
   cp ../.env.example ../.env
   # Edit .env with your actual values
   ```

3. **Run the desired script:**
   ```bash
   node <script-name>.js
   ```