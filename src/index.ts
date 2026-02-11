/**
 * # sham3js
 *
 * Generate massive amounts of fake web3 data for testing and development.
 * The faker.js for blockchain.
 *
 * @example
 * ```ts
 * // Use the default instance
 * import { sham } from 'sham3js';
 * sham.address.wallet();
 *
 * // Or create your own instance
 * import { Sham3 } from 'sham3js';
 * const sham = new Sham3({ seed: 42, chain: 'solana' });
 * ```
 *
 * @packageDocumentation
 */

export { Sham3 } from './sham3.js';

// Re-export all types
export type { ChainConfig, ChainFamily, ChainName } from './core/chains.js';
export { CHAINS } from './core/chains.js';

export type { TokenInfo, TokenBalance } from './modules/token.js';
export type { NFTMetadata, NFTTrait, NFTCollection } from './modules/nft.js';
export type {
  EVMTransaction,
  EVMTransactionReceipt,
  EVMLog,
  SolanaTransaction,
  SolanaInstruction,
} from './modules/transaction.js';
export type { EVMBlock, SolanaBlock } from './modules/block.js';
export type { OHLCVCandle, SwapEvent, OrderBook, OrderBookEntry, LiquidityPool } from './modules/dex.js';
export type { DAOProposal, DAOVote, DAODelegate, DAOConfig } from './modules/dao.js';
export type { LendingPosition, StakingPosition, YieldVault, AirdropClaim } from './modules/defi.js';
export type { ABIFunction, ABIParam, ContractInfo } from './modules/contract.js';
export type { SignedMessage, EIP712TypedData } from './modules/signature.js';

// Default singleton instance
import { Sham3 } from './sham3.js';

/** Default sham3js instance (Ethereum, random seed) */
export const sham = new Sham3();

export default sham;
