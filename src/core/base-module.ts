import { PRNG } from './prng.js';
import { ChainConfig, CHAINS, ChainName } from './chains.js';

/**
 * Base class for all sham3js modules.
 * Provides access to the shared PRNG and chain context.
 */
export abstract class BaseModule {
  constructor(
    protected readonly rng: PRNG,
    protected readonly getChain: () => ChainConfig
  ) {}

  protected get chain(): ChainConfig {
    return this.getChain();
  }

  protected get isEvm(): boolean {
    return this.chain.family === 'evm';
  }

  protected get isSolana(): boolean {
    return this.chain.family === 'solana';
  }

  /** Generate a realistic timestamp within a range */
  protected timestamp(daysBack: number = 365): Date {
    const now = Date.now();
    const past = now - daysBack * 24 * 60 * 60 * 1000;
    return new Date(this.rng.int(past, now));
  }

  /** Generate multiple items using a generator function */
  multiple<T>(generator: () => T, count: number): T[] {
    return Array.from({ length: count }, () => generator());
  }
}
