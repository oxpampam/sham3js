import { BaseModule } from '../core/base-module.js';
import { DEX_NAMES } from '../data/pools.js';

export interface OHLCVCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SwapEvent {
  dex: string;
  pair: string;
  side: 'buy' | 'sell';
  amountIn: string;
  amountOut: string;
  tokenIn: string;
  tokenOut: string;
  price: number;
  sender: string;
  recipient: string;
  txHash: string;
  timestamp: number;
  gasUsed?: number;
  fee?: number;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export interface OrderBook {
  pair: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
  spreadPercentage: number;
  midPrice: number;
  timestamp: number;
}

export interface LiquidityPool {
  dex: string;
  pair: string;
  token0: { symbol: string; reserve: string; address: string };
  token1: { symbol: string; reserve: string; address: string };
  totalLiquidity: string;
  fee: number;
  apr: number;
  volume24h: number;
  poolAddress: string;
}

/**
 * sham.dex - Generate fake DEX / trading data
 *
 * @example
 * sham.dex.candles(100)       // 100 OHLCV candles with realistic price movement
 * sham.dex.swap()             // A swap event
 * sham.dex.orderBook()        // Full order book
 * sham.dex.pool()             // Liquidity pool info
 */
export class DexModule extends BaseModule {

  /** Generate a DEX name */
  name(): string {
    return this.rng.pick(DEX_NAMES);
  }

  /** Generate a trading pair string */
  pair(): string {
    const bases = ['ETH', 'BTC', 'SOL', 'AVAX', 'MATIC', 'ARB', 'OP', 'LINK', 'UNI', 'AAVE'];
    const quotes = ['USDC', 'USDT', 'DAI', 'ETH', 'WETH'];
    const base = this.rng.pick(bases);
    let quote = this.rng.pick(quotes);
    while (quote === base) quote = this.rng.pick(quotes);
    return `${base}/${quote}`;
  }

  /**
   * Generate realistic OHLCV candles with Geometric Brownian Motion.
   * This produces price data that looks like real market charts.
   */
  candles(
    count: number = 100,
    opts?: {
      startPrice?: number;
      interval?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
      volatility?: number;
      drift?: number;
    }
  ): OHLCVCandle[] {
    const startPrice = opts?.startPrice ?? this.rng.float(0.5, 5000);
    const volatility = opts?.volatility ?? this.rng.float(0.01, 0.08);
    const drift = opts?.drift ?? this.rng.float(-0.001, 0.001);

    const intervals: Record<string, number> = {
      '1m': 60, '5m': 300, '15m': 900,
      '1h': 3600, '4h': 14400, '1d': 86400,
    };
    const intervalSec = intervals[opts?.interval ?? '1h'];
    const now = Math.floor(Date.now() / 1000);
    const startTime = now - count * intervalSec;

    let price = startPrice;
    const candles: OHLCVCandle[] = [];

    for (let i = 0; i < count; i++) {
      const open = price;

      // Simulate intra-candle price movement
      const ticks = this.rng.int(10, 50);
      let high = open;
      let low = open;
      let current = open;

      for (let t = 0; t < ticks; t++) {
        const dt = 1 / ticks;
        const dW = this.rng.gaussian() * Math.sqrt(dt);
        current = current * Math.exp((drift - 0.5 * volatility * volatility) * dt + volatility * dW);
        current = Math.max(current, 0.0001); // floor
        high = Math.max(high, current);
        low = Math.min(low, current);
      }

      const close = current;
      price = close;

      // Volume correlates with price movement
      const priceChange = Math.abs(close - open) / open;
      const baseVolume = this.rng.powerLaw(1000, 10_000_000, 1.3);
      const volume = baseVolume * (1 + priceChange * 10);

      candles.push({
        timestamp: startTime + i * intervalSec,
        open: parseFloat(open.toFixed(8)),
        high: parseFloat(high.toFixed(8)),
        low: parseFloat(low.toFixed(8)),
        close: parseFloat(close.toFixed(8)),
        volume: parseFloat(volume.toFixed(2)),
      });
    }

    return candles;
  }

  /** Generate a swap event */
  swap(overrides?: Partial<SwapEvent>): SwapEvent {
    const side = this.rng.pick(['buy', 'sell'] as const);
    const price = this.rng.float(0.01, 10000);
    const amount = this.rng.powerLaw(0.01, 100000, 1.5);

    return {
      dex: this.name(),
      pair: this.pair(),
      side,
      amountIn: amount.toFixed(6),
      amountOut: (amount * price).toFixed(6),
      tokenIn: '0x' + this.rng.hex(20),
      tokenOut: '0x' + this.rng.hex(20),
      price: parseFloat(price.toFixed(8)),
      sender: '0x' + this.rng.hex(20),
      recipient: '0x' + this.rng.hex(20),
      txHash: '0x' + this.rng.hex(32),
      timestamp: Math.floor(this.timestamp(30).getTime() / 1000),
      gasUsed: this.rng.int(100_000, 350_000),
      ...overrides,
    };
  }

  /** Generate a realistic order book */
  orderBook(opts?: {
    midPrice?: number;
    depth?: number;
    pair?: string;
  }): OrderBook {
    const midPrice = opts?.midPrice ?? this.rng.float(1, 5000);
    const depth = opts?.depth ?? this.rng.int(15, 30);
    const spread = midPrice * this.rng.float(0.0001, 0.005);

    const bids: OrderBookEntry[] = [];
    const asks: OrderBookEntry[] = [];

    // Bids (descending from mid)
    let bidPrice = midPrice - spread / 2;
    for (let i = 0; i < depth; i++) {
      const amount = this.rng.powerLaw(0.1, 1000, 1.3);
      bids.push({
        price: parseFloat(bidPrice.toFixed(8)),
        amount: parseFloat(amount.toFixed(4)),
        total: parseFloat((bidPrice * amount).toFixed(2)),
      });
      bidPrice -= midPrice * this.rng.float(0.0001, 0.002);
    }

    // Asks (ascending from mid)
    let askPrice = midPrice + spread / 2;
    for (let i = 0; i < depth; i++) {
      const amount = this.rng.powerLaw(0.1, 1000, 1.3);
      asks.push({
        price: parseFloat(askPrice.toFixed(8)),
        amount: parseFloat(amount.toFixed(4)),
        total: parseFloat((askPrice * amount).toFixed(2)),
      });
      askPrice += midPrice * this.rng.float(0.0001, 0.002);
    }

    return {
      pair: opts?.pair ?? this.pair(),
      bids,
      asks,
      spread: parseFloat(spread.toFixed(8)),
      spreadPercentage: parseFloat((spread / midPrice * 100).toFixed(4)),
      midPrice: parseFloat(midPrice.toFixed(8)),
      timestamp: Math.floor(Date.now() / 1000),
    };
  }

  /** Generate a liquidity pool */
  pool(): LiquidityPool {
    const token0Symbol = this.rng.pick(['ETH', 'WETH', 'SOL', 'AVAX', 'MATIC']);
    const token1Symbol = this.rng.pick(['USDC', 'USDT', 'DAI']);
    const reserve0 = this.rng.powerLaw(10, 100_000, 1.3);
    const price = this.rng.float(100, 5000);
    const reserve1 = reserve0 * price;

    return {
      dex: this.name(),
      pair: `${token0Symbol}/${token1Symbol}`,
      token0: {
        symbol: token0Symbol,
        reserve: reserve0.toFixed(4),
        address: '0x' + this.rng.hex(20),
      },
      token1: {
        symbol: token1Symbol,
        reserve: reserve1.toFixed(2),
        address: '0x' + this.rng.hex(20),
      },
      totalLiquidity: (reserve1 * 2).toFixed(2),
      fee: this.rng.pick([0.003, 0.005, 0.01, 0.003, 0.001]),
      apr: this.rng.float(2, 150),
      volume24h: this.rng.powerLaw(10_000, 50_000_000, 1.3),
      poolAddress: '0x' + this.rng.hex(20),
    };
  }

  /** Generate a series of swap events (trade history) */
  tradeHistory(count: number = 50): SwapEvent[] {
    const p = this.pair();
    const dex = this.name();
    return Array.from({ length: count }, () => this.swap({ pair: p, dex }));
  }
}
