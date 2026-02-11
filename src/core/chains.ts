/**
 * Chain definitions and configuration.
 * sham3js is chain-aware — address formats, tx structures, and conventions
 * change based on which chain is active.
 */

export type ChainFamily = 'evm' | 'solana';

export interface ChainConfig {
  name: string;
  family: ChainFamily;
  chainId?: number;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockTimeMs: number;
  addressPrefix?: string;
  explorerUrl?: string;
}

export const CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    name: 'Ethereum',
    family: 'evm',
    chainId: 1,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockTimeMs: 12000,
    explorerUrl: 'https://etherscan.io',
  },
  polygon: {
    name: 'Polygon',
    family: 'evm',
    chainId: 137,
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    blockTimeMs: 2000,
    explorerUrl: 'https://polygonscan.com',
  },
  arbitrum: {
    name: 'Arbitrum One',
    family: 'evm',
    chainId: 42161,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockTimeMs: 250,
    explorerUrl: 'https://arbiscan.io',
  },
  optimism: {
    name: 'OP Mainnet',
    family: 'evm',
    chainId: 10,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockTimeMs: 2000,
    explorerUrl: 'https://optimistic.etherscan.io',
  },
  base: {
    name: 'Base',
    family: 'evm',
    chainId: 8453,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockTimeMs: 2000,
    explorerUrl: 'https://basescan.org',
  },
  avalanche: {
    name: 'Avalanche C-Chain',
    family: 'evm',
    chainId: 43114,
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
    blockTimeMs: 2000,
    explorerUrl: 'https://snowtrace.io',
  },
  bsc: {
    name: 'BNB Smart Chain',
    family: 'evm',
    chainId: 56,
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    blockTimeMs: 3000,
    explorerUrl: 'https://bscscan.com',
  },
  solana: {
    name: 'Solana',
    family: 'solana',
    nativeCurrency: { name: 'SOL', symbol: 'SOL', decimals: 9 },
    blockTimeMs: 400,
    explorerUrl: 'https://explorer.solana.com',
  },
};

export type ChainName = keyof typeof CHAINS;
