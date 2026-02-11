import { BaseModule } from '../core/base-module.js';
import { EVM_EVENT_SIGNATURES } from '../data/pools.js';

export interface EVMTransaction {
  hash: string;
  blockNumber: number;
  blockHash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasUsed: number;
  gasLimit: number;
  nonce: number;
  input: string;
  timestamp: number;
  status: 1 | 0;
  type: 0 | 1 | 2;
}

export interface EVMTransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  from: string;
  to: string;
  gasUsed: number;
  cumulativeGasUsed: number;
  effectiveGasPrice: string;
  status: 1 | 0;
  logs: EVMLog[];
  contractAddress: string | null;
}

export interface EVMLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}

export interface SolanaTransaction {
  signature: string;
  slot: number;
  blockTime: number;
  fee: number;
  status: 'success' | 'failed';
  signer: string;
  instructions: SolanaInstruction[];
}

export interface SolanaInstruction {
  programId: string;
  accounts: string[];
  data: string;
}

/**
 * sham.transaction - Generate fake transaction data
 *
 * @example
 * sham.transaction.hash()         // '0x8a2f...'
 * sham.transaction.evm()          // full EVM transaction object
 * sham.transaction.receipt()      // transaction receipt with logs
 * sham.transaction.solana()       // Solana transaction
 */
export class TransactionModule extends BaseModule {

  /** Generate a transaction hash */
  hash(): string {
    if (this.isSolana) return this.solanaSignature();
    return '0x' + this.rng.hex(32);
  }

  /** Generate a block hash */
  blockHash(): string {
    return '0x' + this.rng.hex(32);
  }

  /** Generate a Solana transaction signature */
  solanaSignature(): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let sig = '';
    for (let i = 0; i < 88; i++) {
      sig += chars[this.rng.int(0, chars.length - 1)];
    }
    return sig;
  }

  /** Generate a realistic gas price (in wei) */
  gasPrice(): string {
    // Realistic range: 5-200 gwei
    const gwei = this.rng.float(5, 200);
    return BigInt(Math.floor(gwei * 1e9)).toString();
  }

  /** Generate a realistic gas amount */
  gasUsed(type: 'transfer' | 'swap' | 'mint' | 'deploy' | 'complex' = 'transfer'): number {
    const ranges: Record<string, [number, number]> = {
      transfer: [21000, 21000],
      swap: [100_000, 350_000],
      mint: [50_000, 250_000],
      deploy: [500_000, 5_000_000],
      complex: [200_000, 1_000_000],
    };
    const [min, max] = ranges[type];
    return this.rng.int(min, max);
  }

  /** Generate calldata (function selector + params) */
  calldata(length?: number): string {
    const len = length ?? this.rng.pick([4, 36, 68, 100, 132, 164]);
    return '0x' + this.rng.hex(len);
  }

  /** Generate a full EVM transaction */
  evm(overrides?: Partial<EVMTransaction>): EVMTransaction {
    const gasUsed = this.gasUsed(this.rng.pick(['transfer', 'swap', 'mint', 'complex']));

    return {
      hash: '0x' + this.rng.hex(32),
      blockNumber: this.rng.int(15_000_000, 20_000_000),
      blockHash: '0x' + this.rng.hex(32),
      from: '0x' + this.rng.hex(20),
      to: '0x' + this.rng.hex(20),
      value: BigInt(Math.floor(this.rng.powerLaw(1, 1e22, 1.5))).toString(),
      gasPrice: this.gasPrice(),
      gasUsed,
      gasLimit: Math.floor(gasUsed * this.rng.float(1.1, 2.0)),
      nonce: this.rng.int(0, 5000),
      input: this.rng.chance(0.3) ? '0x' : this.calldata(),
      timestamp: Math.floor(this.timestamp(90).getTime() / 1000),
      status: this.rng.chance(0.95) ? 1 : 0,
      type: this.rng.pick([0, 1, 2]),
      ...overrides,
    };
  }

  /** Generate an EVM event log */
  log(overrides?: Partial<EVMLog>): EVMLog {
    const topicCount = this.rng.int(1, 4);
    const topics = Array.from({ length: topicCount }, () => '0x' + this.rng.hex(32));

    return {
      address: '0x' + this.rng.hex(20),
      topics,
      data: '0x' + this.rng.hex(this.rng.pick([32, 64, 96, 128])),
      blockNumber: this.rng.int(15_000_000, 20_000_000),
      transactionHash: '0x' + this.rng.hex(32),
      logIndex: this.rng.int(0, 300),
      ...overrides,
    };
  }

  /** Generate a full transaction receipt */
  receipt(overrides?: Partial<EVMTransactionReceipt>): EVMTransactionReceipt {
    const logCount = this.rng.int(0, 8);
    const txHash = '0x' + this.rng.hex(32);
    const blockNumber = this.rng.int(15_000_000, 20_000_000);
    const gasUsed = this.gasUsed('complex');

    return {
      transactionHash: txHash,
      blockNumber,
      blockHash: '0x' + this.rng.hex(32),
      from: '0x' + this.rng.hex(20),
      to: '0x' + this.rng.hex(20),
      gasUsed,
      cumulativeGasUsed: gasUsed + this.rng.int(0, 10_000_000),
      effectiveGasPrice: this.gasPrice(),
      status: this.rng.chance(0.95) ? 1 : 0,
      logs: Array.from({ length: logCount }, (_, i) =>
        this.log({ transactionHash: txHash, blockNumber, logIndex: i })
      ),
      contractAddress: this.rng.chance(0.1) ? '0x' + this.rng.hex(20) : null,
      ...overrides,
    };
  }

  /** Generate a Solana transaction */
  solana(overrides?: Partial<SolanaTransaction>): SolanaTransaction {
    const instructionCount = this.rng.int(1, 6);
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const makeAddr = () => {
      let a = '';
      for (let i = 0; i < 44; i++) a += chars[this.rng.int(0, chars.length - 1)];
      return a;
    };

    return {
      signature: this.solanaSignature(),
      slot: this.rng.int(200_000_000, 300_000_000),
      blockTime: Math.floor(this.timestamp(90).getTime() / 1000),
      fee: this.rng.int(5000, 50000), // lamports
      status: this.rng.chance(0.97) ? 'success' : 'failed',
      signer: makeAddr(),
      instructions: Array.from({ length: instructionCount }, () => ({
        programId: makeAddr(),
        accounts: Array.from({ length: this.rng.int(2, 8) }, () => makeAddr()),
        data: this.rng.hex(this.rng.int(8, 64)),
      })),
      ...overrides,
    };
  }

  /** Generate a transaction appropriate for the current chain */
  any(): EVMTransaction | SolanaTransaction {
    if (this.isSolana) return this.solana();
    return this.evm();
  }

  /** Generate an event signature hash (topic[0]) */
  eventSignature(): string {
    return '0x' + this.rng.hex(32);
  }
}
