import { PRNG } from './core/prng.js';
import { CHAINS, ChainConfig, ChainName } from './core/chains.js';
import { AddressModule } from './modules/address.js';
import { TokenModule } from './modules/token.js';
import { NFTModule } from './modules/nft.js';
import { TransactionModule } from './modules/transaction.js';
import { BlockModule } from './modules/block.js';
import { DexModule } from './modules/dex.js';
import { DAOModule } from './modules/dao.js';
import { DefiModule } from './modules/defi.js';
import { ContractModule } from './modules/contract.js';
import { SignatureModule } from './modules/signature.js';
import { ScenarioModule } from './scenarios/index.js';

/**
 * # sham3js
 *
 * Generate massive amounts of fake web3 data for testing and development.
 *
 * @example
 * ```ts
 * import { sham } from 'sham3js';
 *
 * // Set a seed for deterministic output
 * sham.seed(42);
 *
 * // Generate data
 * sham.address.wallet();           // '0x742d35Cc...'
 * sham.nft.metadata();             // Full NFT metadata JSON
 * sham.dex.candles(100);           // 100 OHLCV candles
 * sham.dao.proposal();             // DAO governance proposal
 * sham.scenario.nftDrop(10000);    // Full 10k collection
 *
 * // Switch chains
 * sham.setChain('solana');
 * sham.address.any();              // Solana base58 address
 * ```
 */
export class Sham3 {
  private rng: PRNG;
  private chainConfig: ChainConfig;

  /** Address generation (wallets, contracts, ENS, Solana) */
  readonly address: AddressModule;
  /** Token generation (ERC-20, SPL, balances, prices) */
  readonly token: TokenModule;
  /** NFT generation (metadata, collections, traits) */
  readonly nft: NFTModule;
  /** Transaction generation (hashes, receipts, logs) */
  readonly transaction: TransactionModule;
  /** Block generation (headers, Solana slots) */
  readonly block: BlockModule;
  /** DEX generation (candles, swaps, order books, pools) */
  readonly dex: DexModule;
  /** DAO governance generation (proposals, votes, delegates) */
  readonly dao: DAOModule;
  /** DeFi generation (lending, staking, vaults, airdrops) */
  readonly defi: DefiModule;
  /** Smart contract generation (ABIs, bytecode, deployments) */
  readonly contract: ContractModule;
  /** Signature generation (ECDSA, EIP-712, personal sign) */
  readonly signature: SignatureModule;
  /** Pre-built complex test scenarios */
  readonly scenario: ScenarioModule;

  constructor(opts?: { seed?: number; chain?: ChainName }) {
    this.rng = new PRNG(opts?.seed ?? Date.now());
    this.chainConfig = CHAINS[opts?.chain ?? 'ethereum'];

    const getChain = () => this.chainConfig;

    this.address = new AddressModule(this.rng, getChain);
    this.token = new TokenModule(this.rng, getChain);
    this.nft = new NFTModule(this.rng, getChain);
    this.transaction = new TransactionModule(this.rng, getChain);
    this.block = new BlockModule(this.rng, getChain);
    this.dex = new DexModule(this.rng, getChain);
    this.dao = new DAOModule(this.rng, getChain);
    this.defi = new DefiModule(this.rng, getChain);
    this.contract = new ContractModule(this.rng, getChain);
    this.signature = new SignatureModule(this.rng, getChain);
    this.scenario = new ScenarioModule(this.rng, getChain);
  }

  /** Set the PRNG seed for deterministic output */
  seed(value: number): void {
    this.rng.seed(value);
  }

  /** Switch the active blockchain */
  setChain(chain: ChainName | string): void {
    if (chain in CHAINS) {
      this.chainConfig = CHAINS[chain];
    } else {
      throw new Error(`Unknown chain: ${chain}. Available: ${Object.keys(CHAINS).join(', ')}`);
    }
  }

  /** Get the active chain config */
  getChain(): ChainConfig {
    return this.chainConfig;
  }

  /** Get list of available chains */
  get chains(): string[] {
    return Object.keys(CHAINS);
  }

  /** Generate multiple of anything using a callback */
  helpers = {
    multiple: <T>(generator: () => T, opts: { count: number }): T[] => {
      return Array.from({ length: opts.count }, () => generator());
    },

    /** Generate a fake helper template string (faker-style) */
    fake: (template: string): string => {
      return template.replace(/\{\{(\w+)\.(\w+)\(\)\}\}/g, (_match, module, method) => {
        const mod = (this as any)[module];
        if (mod && typeof mod[method] === 'function') {
          return String(mod[method]());
        }
        return _match;
      });
    },
  };
}
