import { BaseModule } from '../core/base-module.js';
import { TOKEN_NAMES, TOKEN_SUFFIXES, STABLECOIN_NAMES } from '../data/pools.js';

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  address: string;
}

export interface TokenBalance {
  token: TokenInfo;
  balance: string;
  balanceFormatted: string;
  valueUsd: number;
}

/**
 * sham.token - Generate fake token data
 *
 * @example
 * sham.token.erc20()           // { name: 'Flux Protocol', symbol: 'FLUX', decimals: 18, ... }
 * sham.token.symbol()          // 'PRISM'
 * sham.token.balance()         // { token: {...}, balance: '1500000000000000000', ... }
 */
export class TokenModule extends BaseModule {

  /** Generate a random token symbol (3-5 uppercase chars) */
  symbol(): string {
    const name = this.rng.pick(TOKEN_NAMES);
    const len = this.rng.int(3, 5);
    return name.toUpperCase().slice(0, len);
  }

  /** Generate a full token name */
  name(): string {
    const base = this.rng.pick(TOKEN_NAMES);
    const suffix = this.rng.pick(TOKEN_SUFFIXES);
    return suffix ? `${base} ${suffix}` : base;
  }

  /** Generate a stablecoin symbol */
  stablecoin(): string {
    return this.rng.pick(STABLECOIN_NAMES);
  }

  /** Generate complete ERC-20 / SPL token info */
  erc20(overrides?: Partial<TokenInfo>): TokenInfo {
    const name = overrides?.name ?? this.name();
    const symbol = overrides?.symbol ?? this.symbol();
    const decimals = overrides?.decimals ?? this.rng.pick([6, 8, 9, 18]);
    const supplyBase = this.rng.powerLaw(1_000, 1_000_000_000, 1.2);
    const totalSupply = BigInt(Math.floor(supplyBase)) * BigInt(10 ** decimals);

    return {
      name,
      symbol,
      decimals,
      totalSupply: totalSupply.toString(),
      address: this.isSolana ? this.solanaAddress() : this.evmAddress(),
      ...overrides,
    };
  }

  /** Alias for erc20 */
  spl(overrides?: Partial<TokenInfo>): TokenInfo {
    return this.erc20(overrides);
  }

  /** Generate a token balance for a holder */
  balance(token?: TokenInfo): TokenBalance {
    const t = token ?? this.erc20();
    const maxBalance = Number(BigInt(t.totalSupply) / 100n); // max 1% of supply
    const rawBalance = BigInt(Math.floor(this.rng.powerLaw(1, maxBalance, 1.5)));
    const formatted = Number(rawBalance) / 10 ** t.decimals;
    const price = this.rng.float(0.001, 1000);

    return {
      token: t,
      balance: rawBalance.toString(),
      balanceFormatted: formatted.toFixed(t.decimals > 8 ? 4 : 2),
      valueUsd: parseFloat((formatted * price).toFixed(2)),
    };
  }

  /** Generate a token price in USD */
  price(opts?: { min?: number; max?: number }): number {
    const min = opts?.min ?? 0.0001;
    const max = opts?.max ?? 100_000;
    return parseFloat(this.rng.powerLaw(min, max, 1.3).toFixed(8));
  }

  /** Generate a token pair (e.g., for a DEX pool) */
  pair(): { token0: TokenInfo; token1: TokenInfo } {
    return {
      token0: this.erc20(),
      token1: this.rng.chance(0.6) ? this.erc20({ symbol: this.stablecoin(), decimals: 6 }) : this.erc20(),
    };
  }

  /** Generate a market cap */
  marketCap(): number {
    return parseFloat(this.rng.powerLaw(10_000, 100_000_000_000, 1.2).toFixed(0));
  }

  // -- helpers --

  private evmAddress(): string {
    return '0x' + this.rng.hex(20);
  }

  private solanaAddress(): string {
    // Simplified — use address module for proper base58
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let addr = '';
    for (let i = 0; i < 44; i++) {
      addr += chars[this.rng.int(0, chars.length - 1)];
    }
    return addr;
  }
}
