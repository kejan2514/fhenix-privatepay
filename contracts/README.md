# PrivatePay contracts

CoFHE-powered confidential test token for PrivatePay.

## Local development

```bash
npm install
npm test
```

The test suite deploys the official CoFHE mock contracts, then verifies faucet,
encrypted transfers, insufficient-balance protection, and balance privacy.

## Testnet deployment

Copy `.env.example` to `.env`, provide an Arbitrum Sepolia RPC URL and a funded
deployment key, then run:

```bash
npm run deploy:arb-sepolia
```

Never commit `.env` or a private key.
