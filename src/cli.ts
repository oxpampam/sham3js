#!/usr/bin/env node

import { Sham3 } from './sham3.js';
import { CHAINS } from './core/chains.js';

const args = process.argv.slice(2);

function printHelp(): void {
  console.log(`
  sham3js - Generate fake web3 data

  USAGE
    sham3 <module>.<method> [options]

  MODULES
    address     Wallet/contract addresses, ENS names
    token       ERC-20 tokens, prices, balances
    nft         NFT metadata, collections, traits
    transaction Tx hashes, receipts, logs
    block       Block headers
    dex         OHLCV candles, swaps, order books
    dao         Proposals, votes, delegates
    defi        Lending, staking, vaults, airdrops
    contract    ABIs, bytecode, deployments
    signature   ECDSA signatures, EIP-712
    scenario    Complex pre-built scenarios

  OPTIONS
    --count, -n     Number of items to generate (default: 1)
    --chain, -c     Blockchain (${Object.keys(CHAINS).join(', ')})
    --seed, -s      PRNG seed for reproducible output
    --pretty, -p    Pretty print JSON (default: true)
    --output, -o    Output file path

  EXAMPLES
    sham3 address.wallet -n 10
    sham3 nft.metadata --chain solana
    sham3 dex.candles -n 100 --seed 42
    sham3 scenario.nftDrop -n 100 -o ./nfts.json
    sham3 dao.election
`);
}

function parseArgs(args: string[]): {
  command?: string;
  count: number;
  chain: string;
  seed?: number;
  pretty: boolean;
  output?: string;
} {
  let command: string | undefined;
  let count = 1;
  let chain = 'ethereum';
  let seed: number | undefined;
  let pretty = true;
  let output: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '--count' || arg === '-n') {
      count = parseInt(args[++i], 10);
    } else if (arg === '--chain' || arg === '-c') {
      chain = args[++i];
    } else if (arg === '--seed' || arg === '-s') {
      seed = parseInt(args[++i], 10);
    } else if (arg === '--no-pretty') {
      pretty = false;
    } else if (arg === '--output' || arg === '-o') {
      output = args[++i];
    } else if (!arg.startsWith('-')) {
      command = arg;
    }
  }

  return { command, count, chain, seed, pretty, output };
}

async function main(): Promise<void> {
  if (args.length === 0) {
    printHelp();
    process.exit(0);
  }

  const opts = parseArgs(args);

  if (!opts.command) {
    console.error('Error: No command specified. Run `sham3 --help` for usage.');
    process.exit(1);
  }

  const [moduleName, methodName] = opts.command.split('.');

  if (!methodName) {
    console.error(`Error: Invalid command "${opts.command}". Use format: module.method`);
    process.exit(1);
  }

  const sham = new Sham3({ seed: opts.seed, chain: opts.chain as any });

  const mod = (sham as any)[moduleName];
  if (!mod) {
    console.error(`Error: Unknown module "${moduleName}".`);
    process.exit(1);
  }

  const method = mod[methodName];
  if (typeof method !== 'function') {
    console.error(`Error: Unknown method "${methodName}" on module "${moduleName}".`);
    process.exit(1);
  }

  let result: any;

  // For scenarios and methods that take count as first arg
  const countMethods = ['collection', 'election', 'tradeHistory', 'candles', 'airdrop', 'wallets'];
  if (countMethods.includes(methodName)) {
    result = method.call(mod, opts.count);
  } else if (opts.count > 1) {
    result = Array.from({ length: opts.count }, () => method.call(mod));
  } else {
    result = method.call(mod);
  }

  const json = opts.pretty ? JSON.stringify(result, null, 2) : JSON.stringify(result);

  if (opts.output) {
    const fs = await import('fs');
    fs.writeFileSync(opts.output, json, 'utf-8');
    console.log(`Written to ${opts.output} (${Buffer.byteLength(json)} bytes)`);
  } else {
    console.log(json);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
