import { BaseModule } from '../core/base-module.js';

export interface EVMBlock {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  gasUsed: number;
  gasLimit: number;
  baseFeePerGas: string;
  miner: string;
  nonce: string;
  difficulty: string;
  totalDifficulty: string;
  size: number;
  transactionCount: number;
  extraData: string;
}

export interface SolanaBlock {
  slot: number;
  blockhash: string;
  parentSlot: number;
  blockTime: number;
  blockHeight: number;
  transactionCount: number;
  leader: string;
  rewards: { pubkey: string; lamports: number; postBalance: number }[];
}

/**
 * sham.block - Generate fake block data
 *
 * @example
 * sham.block.evm()          // Full EVM block header
 * sham.block.solana()       // Solana block/slot
 * sham.block.number()       // 19482610
 */
export class BlockModule extends BaseModule {

  /** Generate a block number */
  number(): number {
    if (this.isSolana) return this.rng.int(200_000_000, 300_000_000);
    return this.rng.int(15_000_000, 21_000_000);
  }

  /** Generate a full EVM block */
  evm(overrides?: Partial<EVMBlock>): EVMBlock {
    const gasLimit = 30_000_000;
    const gasUsed = this.rng.int(Math.floor(gasLimit * 0.3), gasLimit);
    const baseFee = this.rng.float(5, 200); // gwei

    return {
      number: this.rng.int(15_000_000, 21_000_000),
      hash: '0x' + this.rng.hex(32),
      parentHash: '0x' + this.rng.hex(32),
      timestamp: Math.floor(this.timestamp(90).getTime() / 1000),
      gasUsed,
      gasLimit,
      baseFeePerGas: BigInt(Math.floor(baseFee * 1e9)).toString(),
      miner: '0x' + this.rng.hex(20),
      nonce: '0x' + this.rng.hex(8),
      difficulty: '0',
      totalDifficulty: '0',
      size: this.rng.int(20_000, 200_000),
      transactionCount: this.rng.int(50, 400),
      extraData: '0x' + this.rng.hex(this.rng.int(4, 32)),
      ...overrides,
    };
  }

  /** Generate a Solana block */
  solana(overrides?: Partial<SolanaBlock>): SolanaBlock {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const makeAddr = () => {
      let a = '';
      for (let i = 0; i < 44; i++) a += chars[this.rng.int(0, chars.length - 1)];
      return a;
    };

    const slot = this.rng.int(200_000_000, 300_000_000);
    return {
      slot,
      blockhash: makeAddr(),
      parentSlot: slot - 1,
      blockTime: Math.floor(this.timestamp(90).getTime() / 1000),
      blockHeight: slot - this.rng.int(0, 1000),
      transactionCount: this.rng.int(500, 3000),
      leader: makeAddr(),
      rewards: Array.from({ length: this.rng.int(1, 5) }, () => ({
        pubkey: makeAddr(),
        lamports: this.rng.int(1000, 1_000_000),
        postBalance: this.rng.int(1_000_000_000, 100_000_000_000),
      })),
      ...overrides,
    };
  }

  /** Generate a block appropriate for the current chain */
  any(): EVMBlock | SolanaBlock {
    if (this.isSolana) return this.solana();
    return this.evm();
  }
}
