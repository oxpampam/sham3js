import { PRNG } from '../core/prng.js';
import { ChainConfig } from '../core/chains.js';
import { AddressModule } from '../modules/address.js';
import { NFTModule, type NFTCollection } from '../modules/nft.js';
import { DAOModule, type DAOProposal, type DAOVote } from '../modules/dao.js';
import { DexModule, type OHLCVCandle, type SwapEvent } from '../modules/dex.js';
import { TokenModule } from '../modules/token.js';
import { TransactionModule } from '../modules/transaction.js';
import { DefiModule } from '../modules/defi.js';

/**
 * sham.scenario - Pre-built complex test data generators
 *
 * @example
 * sham.scenario.nftDrop(10000)          // Full 10k PFP collection
 * sham.scenario.daoElection(3, 500)     // 3 proposals, 500 voters
 * sham.scenario.dexTrading(1000)        // 1000 candles + trades
 * sham.scenario.walletPortfolio()       // Realistic wallet with balances
 */
export class ScenarioModule {
  private address: AddressModule;
  private nft: NFTModule;
  private dao: DAOModule;
  private dex: DexModule;
  private token: TokenModule;
  private tx: TransactionModule;
  private defi: DefiModule;

  constructor(
    private rng: PRNG,
    private getChain: () => ChainConfig
  ) {
    this.address = new AddressModule(rng, getChain);
    this.nft = new NFTModule(rng, getChain);
    this.dao = new DAOModule(rng, getChain);
    this.dex = new DexModule(rng, getChain);
    this.token = new TokenModule(rng, getChain);
    this.tx = new TransactionModule(rng, getChain);
    this.defi = new DefiModule(rng, getChain);
  }

  /** Generate a full NFT drop with collection metadata and individual NFTs */
  nftDrop(size: number = 10_000, opts?: { name?: string }): NFTCollection {
    return this.nft.collection(size, opts);
  }

  /** Generate a complete DAO election scenario */
  daoElection(
    proposalCount: number = 3,
    voterCount: number = 500
  ): {
    proposals: DAOProposal[];
    votes: DAOVote[];
    delegates: ReturnType<DAOModule['delegate']>[];
    config: ReturnType<DAOModule['config']>;
  } {
    const { proposals, votes } = this.dao.election(proposalCount, voterCount);
    const delegateCount = Math.min(voterCount, this.rng.int(20, 100));
    const delegates = Array.from({ length: delegateCount }, () => this.dao.delegate());
    const config = this.dao.config();

    return { proposals, votes, delegates, config };
  }

  /** Generate DEX trading data with candles + matching trade history */
  dexTrading(
    candleCount: number = 500,
    opts?: {
      pair?: string;
      startPrice?: number;
      interval?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
    }
  ): {
    pair: string;
    candles: OHLCVCandle[];
    trades: SwapEvent[];
    pool: ReturnType<DexModule['pool']>;
    orderBook: ReturnType<DexModule['orderBook']>;
  } {
    const pair = opts?.pair ?? this.dex.pair();
    const candles = this.dex.candles(candleCount, opts);
    const lastCandle = candles[candles.length - 1];
    const trades = this.dex.tradeHistory(candleCount * 2);
    const pool = this.dex.pool();
    const orderBook = this.dex.orderBook({ midPrice: lastCandle.close, pair });

    return { pair, candles, trades, pool, orderBook };
  }

  /** Generate a realistic wallet portfolio */
  walletPortfolio(opts?: { tokenCount?: number }): {
    address: string;
    nativeBalance: string;
    tokens: ReturnType<TokenModule['balance']>[];
    nfts: { collection: string; tokenId: number; imageUrl: string }[];
    totalValueUsd: number;
    transactionCount: number;
  } {
    const tokenCount = opts?.tokenCount ?? this.rng.int(3, 15);
    const tokens = Array.from({ length: tokenCount }, () => this.token.balance());
    const nftCount = this.rng.int(0, 20);

    const nativeBalance = this.rng.powerLaw(0.01, 1000, 1.5);
    const nativePrice = this.rng.float(500, 5000);
    const nftItems = Array.from({ length: nftCount }, () => ({
      collection: this.nft.collectionName(),
      tokenId: this.rng.int(1, 10000),
      imageUrl: this.nft.imageUrl(),
    }));

    const totalValueUsd = tokens.reduce((sum, t) => sum + t.valueUsd, 0) + nativeBalance * nativePrice;

    return {
      address: this.address.any(),
      nativeBalance: nativeBalance.toFixed(6),
      tokens,
      nfts: nftItems,
      totalValueUsd: parseFloat(totalValueUsd.toFixed(2)),
      transactionCount: this.rng.int(10, 50_000),
    };
  }

  /** Generate a token airdrop scenario */
  airdrop(recipientCount: number = 1000): {
    token: ReturnType<TokenModule['erc20']>;
    claims: ReturnType<DefiModule['airdrop']>;
    merkleRoot: string;
    totalAllocation: string;
  } {
    const token = this.token.erc20();
    const claims = this.defi.airdrop(recipientCount, token.symbol);
    const totalAllocation = claims.reduce(
      (sum, c) => sum + BigInt(c.amount),
      0n
    );

    return {
      token,
      claims,
      merkleRoot: '0x' + this.rng.hex(32),
      totalAllocation: totalAllocation.toString(),
    };
  }

  /** Generate a complete block with transactions */
  fullBlock(txCount?: number): {
    block: ReturnType<TransactionModule['evm']> extends infer T ? any : never;
    transactions: ReturnType<TransactionModule['evm']>[];
    receipts: ReturnType<TransactionModule['receipt']>[];
  } {
    const count = txCount ?? this.rng.int(50, 300);
    const blockNumber = this.rng.int(15_000_000, 21_000_000);
    const blockHash = '0x' + this.rng.hex(32);
    const timestamp = Math.floor(this.timestamp(90).getTime() / 1000);

    const transactions = Array.from({ length: count }, () =>
      this.tx.evm({ blockNumber, blockHash, timestamp })
    );

    const receipts = transactions.map((tx) =>
      this.tx.receipt({
        transactionHash: tx.hash,
        blockNumber,
        blockHash,
        from: tx.from,
        to: tx.to,
      })
    );

    return {
      block: {
        number: blockNumber,
        hash: blockHash,
        parentHash: '0x' + this.rng.hex(32),
        timestamp,
        gasUsed: transactions.reduce((sum, tx) => sum + tx.gasUsed, 0),
        gasLimit: 30_000_000,
        transactionCount: count,
      },
      transactions,
      receipts,
    };
  }

  private timestamp(daysBack: number = 365): Date {
    const now = Date.now();
    const past = now - daysBack * 24 * 60 * 60 * 1000;
    return new Date(this.rng.int(past, now));
  }
}
