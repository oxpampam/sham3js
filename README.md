# sham3js

> No data? No problem! Generate massive amounts of fake web3 data for testing and development.  


[![npm](https://img.shields.io/npm/v/sham3js)](https://www.npmjs.com/package/sham3js)
[![TypeScript](https://img.shields.io/badge/TypeScript-first-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)]()

```ts
import { sham } from 'sham3js';

sham.seed(42); // Deterministic output

sham.address.wallet();          // '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28'
sham.nft.metadata();            // Full ERC-721 metadata JSON
sham.dex.candles(100);          // 100 realistic OHLCV candles
sham.dao.proposal();            // DAO governance proposal
sham.scenario.nftDrop(10000);   // Full 10k PFP collection
```

---

## Why sham3js?

Building web3 apps means constantly needing test data: wallet addresses, NFT metadata, transaction histories, price feeds, DAO votes, airdrop lists... Currently you either hand-craft JSON fixtures or write throwaway scripts every time. 

sham3js gives you **one library** that generates all of it — realistic, typed, deterministic, and chain-aware.

## Features

- 🎯 **10 specialized modules** — addresses, tokens, NFTs, transactions, blocks, DEX data, DAO governance, DeFi, contracts, signatures
- 🎬 **Scenario generators** — pre-built complex test setups (NFT drops, DAO elections, trading simulations)
- 🌐 **Multi-chain** — EVM (Ethereum, Polygon, Arbitrum, Base, Optimism, Avalanche, BSC) + Solana
- 🎲 **Seedable PRNG** — deterministic output for reproducible tests
- 📊 **Realistic distributions** — power-law token holdings, Geometric Brownian Motion price data, weighted vote distributions
- 📦 **Zero dependencies** — pure TypeScript, ~60KB bundled
- 🔧 **TypeScript-first** — full type exports for every generated structure
- 🖥️ **CLI included** — generate data from the command line

---

## Install

```bash
npm install sham3js
# or
yarn add sham3js
# or
pnpm add sham3js
```

---

## Quick Start

```ts
import { sham } from 'sham3js';

// Or create your own instance
import { Sham3 } from 'sham3js';
const sham = new Sham3({ seed: 42, chain: 'solana' });
```

---

## API Reference

### `sham.address` — Wallet & Contract Addresses

```ts
sham.address.wallet()       // '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28'
sham.address.contract()     // '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
sham.address.ens()          // 'degenwhale.eth'
sham.address.solana()       // '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
sham.address.zero()         // '0x0000000000000000000000000000000000000000'
sham.address.dead()         // '0x000000000000000000000000000000000000dEaD'
sham.address.any()          // Chain-appropriate address
sham.address.wallets(100)   // 100 unique addresses
```

### `sham.token` — ERC-20 / SPL Tokens

```ts
sham.token.erc20()
// {
//   name: 'Flux Protocol',
//   symbol: 'FLUX',
//   decimals: 18,
//   totalSupply: '1000000000000000000000000',
//   address: '0xa3f...'
// }

sham.token.symbol()         // 'PRISM'
sham.token.name()           // 'Nexus Finance'
sham.token.stablecoin()     // 'USDC'
sham.token.price()          // 2847.53
sham.token.balance()        // { token, balance, balanceFormatted, valueUsd }
sham.token.pair()           // { token0, token1 }
sham.token.marketCap()      // 54200000000
```

### `sham.nft` — NFT Metadata & Collections

```ts
sham.nft.metadata()
// {
//   name: 'Cosmic Apes #4217',
//   description: 'A unique Cosmic Apes NFT...',
//   image: 'ipfs://Qm.../4217.png',
//   external_url: 'https://cosmicapes.xyz/token/4217',
//   attributes: [
//     { trait_type: 'Background', value: 'Aquamarine' },
//     { trait_type: 'Eyes', value: 'Laser' },
//     { trait_type: 'Hat', value: 'Crown' },
//   ]
// }

sham.nft.trait()                   // { trait_type: 'Eyes', value: 'Laser' }
sham.nft.traits(6)                 // Array of 6 traits
sham.nft.collectionName()          // 'Mystic Dragons'
sham.nft.ipfsCid()                 // 'Qm8a2f...'
sham.nft.imageUrl(42)              // 'ipfs://Qm.../42.png'
sham.nft.collection(10000)         // Full 10k collection with metadata
sham.nft.royalty()                 // { receiver, bps: 500, percentage: '5.0%' }
```

### `sham.transaction` — Transactions & Receipts

```ts
sham.transaction.hash()            // '0x8a2f3b...' (or Solana signature)
sham.transaction.evm()             // Full EVM transaction object
sham.transaction.receipt()         // Receipt with logs
sham.transaction.solana()          // Solana transaction with instructions
sham.transaction.gasPrice()        // '25000000000' (25 gwei)
sham.transaction.gasUsed('swap')   // 185432
sham.transaction.calldata()        // '0xa9059cbb...'
sham.transaction.log()             // EVM event log
```

### `sham.block` — Block Headers

```ts
sham.block.number()                // 19482610
sham.block.evm()                   // Full EVM block header
sham.block.solana()                // Solana block with slot and rewards
```

### `sham.dex` — DEX & Trading Data

```ts
// Realistic price candles using Geometric Brownian Motion
sham.dex.candles(500, {
  startPrice: 2000,
  interval: '1h',
  volatility: 0.04,
})
// Returns 500 OHLCV candles with realistic price movement

sham.dex.swap()                    // Swap event with amounts, prices, gas
sham.dex.orderBook({ midPrice: 2000 })  // Full order book with bids/asks
sham.dex.pool()                    // Liquidity pool (TVL, APR, reserves)
sham.dex.tradeHistory(100)         // 100 swap events for a pair
sham.dex.pair()                    // 'ETH/USDC'
sham.dex.name()                    // 'Uniswap'
```

### `sham.dao` — DAO Governance

```ts
sham.dao.proposal()
// {
//   id: 42,
//   title: 'Deploy Protocol on Base',
//   status: 'active',
//   forVotes: '12500000000000000000000000',
//   againstVotes: '3200000000000000000000000',
//   ...
// }

sham.dao.vote()                    // Vote with weight, support, reason
sham.dao.delegate()                // Delegate profile with voting stats
sham.dao.config()                  // DAO configuration (quorum, thresholds)
sham.dao.election(5, 1000)         // 5 proposals, 1000 voters, full results
```

### `sham.defi` — DeFi Protocols

```ts
sham.defi.lendingPosition()        // Supply/borrow with APY, health factor
sham.defi.stakingPosition()        // Staking with rewards and lock period
sham.defi.vault()                  // Yield vault (TVL, APY breakdown)
sham.defi.airdrop(1000)            // 1000 claims with Merkle proofs
sham.defi.vestingSchedule()        // Token vesting with cliff and schedule
```

### `sham.contract` — Smart Contracts

```ts
sham.contract.abi()                // Random ABI (functions + events)
sham.contract.erc20Abi()           // Standard ERC-20 ABI
sham.contract.erc721Abi()          // Standard ERC-721 ABI
sham.contract.info()               // Contract deployment info
sham.contract.bytecode(1024)       // Fake bytecode
sham.contract.selector()           // '0xa9059cbb' (4-byte selector)
```

### `sham.signature` — Signatures & Signed Data

```ts
sham.signature.raw()               // 65-byte ECDSA signature
sham.signature.personal()          // Signed message with v, r, s
sham.signature.eip712('permit')    // EIP-712 Permit typed data
sham.signature.eip712('order')     // EIP-712 Exchange Order
sham.signature.eip712('vote')      // EIP-712 Governance Ballot
```

### `sham.scenario` — Complex Scenarios

Pre-built generators for common testing setups:

```ts
// Full NFT drop — collection + 10k items with metadata
const drop = sham.scenario.nftDrop(10000);

// DAO election — proposals + voters + delegates + config
const election = sham.scenario.daoElection(3, 500);

// DEX trading — candles + trades + pool + order book
const trading = sham.scenario.dexTrading(1000);

// Wallet portfolio — tokens + NFTs + native balance
const portfolio = sham.scenario.walletPortfolio();

// Token airdrop — claims with Merkle proofs
const airdrop = sham.scenario.airdrop(5000);

// Full block — block header + transactions + receipts
const block = sham.scenario.fullBlock(200);
```

### `sham.helpers` — Utilities

```ts
// Generate multiple of anything
sham.helpers.multiple(() => sham.address.wallet(), { count: 100 });

// Template strings
sham.helpers.fake('Wallet: {{address.wallet()}}');
```

---

## Multi-Chain Support

```ts
sham.setChain('ethereum');  // Default
sham.setChain('polygon');
sham.setChain('arbitrum');
sham.setChain('optimism');
sham.setChain('base');
sham.setChain('avalanche');
sham.setChain('bsc');
sham.setChain('solana');

// Chain affects address formats, tx structures, and more
sham.setChain('solana');
sham.address.any();         // Base58 Solana address
sham.nft.metadata();        // Includes Metaplex `properties` field

sham.setChain('ethereum');
sham.address.any();         // EIP-55 checksummed address
sham.nft.metadata();        // Standard ERC-721 metadata
```

---

## Deterministic Output

```ts
const a = new Sham3({ seed: 42 });
const b = new Sham3({ seed: 42 });

a.address.wallet() === b.address.wallet(); // true — always
```

---

## CLI

```bash
# Generate 10 wallet addresses
npx sham3 address.wallet -n 10

# Generate NFT metadata for Solana
npx sham3 nft.metadata --chain solana

# Generate 100 OHLCV candles with seed
npx sham3 dex.candles -n 100 --seed 42

# Generate and save to file
npx sham3 scenario.nftDrop -n 1000 -o ./nfts.json

# DAO election data
npx sham3 dao.election
```

---

## Use Cases

| Scenario | How |
|---|---|
| NFT storefront testing | `sham.nft.collection(10000)` → JSON metadata for 10k NFTs |
| DAO governance testing | `sham.scenario.daoElection(5, 10000)` → proposals + voters |
| DEX trading bot testing | `sham.dex.candles(1000)` → realistic OHLCV price data |
| Airdrop testing | `sham.defi.airdrop(50000)` → claims with Merkle proofs |
| Wallet UI development | `sham.scenario.walletPortfolio()` → complete wallet state |
| Subgraph development | `sham.transaction.evm()` + `sham.transaction.log()` → event data |
| Smart contract testing | `sham.address.wallets(100)` → test accounts |
| Price feed mocking | `sham.dex.candles(500, { startPrice: 2000, volatility: 0.05 })` |

---

## Project Structure

```
sham3js/
├── src/
│   ├── index.ts              # Entry point & exports
│   ├── sham3.ts              # Main Sham3 class
│   ├── cli.ts                # CLI tool
│   ├── core/
│   │   ├── prng.ts           # Seeded PRNG (Mulberry32)
│   │   ├── keccak.ts         # Keccak-256 (pure JS)
│   │   ├── chains.ts         # Chain configurations
│   │   └── base-module.ts    # Base class for modules
│   ├── data/
│   │   └── pools.ts          # Static data pools
│   ├── modules/
│   │   ├── address.ts        # Wallet/contract addresses
│   │   ├── token.ts          # ERC-20 / SPL tokens
│   │   ├── nft.ts            # NFT metadata & collections
│   │   ├── transaction.ts    # Transactions & receipts
│   │   ├── block.ts          # Block headers
│   │   ├── dex.ts            # DEX trading data
│   │   ├── dao.ts            # DAO governance
│   │   ├── defi.ts           # DeFi protocols
│   │   ├── contract.ts       # Smart contracts & ABIs
│   │   └── signature.ts      # Signatures & EIP-712
│   └── scenarios/
│       └── index.ts          # Pre-built complex scenarios
├── tests/
│   └── sham3.test.ts         # Test suite (61 tests)
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

---

## Contributing

PRs welcome! Areas that could use help:

- More chain support (Cosmos, Aptos, Sui, TON)
- More realistic data pools (real token names, real collection styles)
- Subgraph entity generation
- Hardhat/Foundry plugin
- Browser bundle

---

## License

MIT
