import { describe, it, expect, beforeEach } from 'vitest';
import { Sham3, sham } from '../src/index.js';

describe('sham3js', () => {

  // ================================================================
  // Core
  // ================================================================

  describe('Core', () => {
    it('exports a default singleton', () => {
      expect(sham).toBeInstanceOf(Sham3);
    });

    it('allows creating custom instances', () => {
      const custom = new Sham3({ seed: 42, chain: 'polygon' });
      expect(custom.getChain().name).toBe('Polygon');
    });

    it('seed produces deterministic output', () => {
      const a = new Sham3({ seed: 12345 });
      const b = new Sham3({ seed: 12345 });
      expect(a.address.wallet()).toBe(b.address.wallet());
      expect(a.nft.collectionName()).toBe(b.nft.collectionName());
      expect(a.token.symbol()).toBe(b.token.symbol());
    });

    it('different seeds produce different output', () => {
      const a = new Sham3({ seed: 1 });
      const b = new Sham3({ seed: 2 });
      expect(a.address.wallet()).not.toBe(b.address.wallet());
    });

    it('lists available chains', () => {
      const s = new Sham3();
      expect(s.chains).toContain('ethereum');
      expect(s.chains).toContain('solana');
      expect(s.chains).toContain('arbitrum');
      expect(s.chains).toContain('base');
    });

    it('throws on unknown chain', () => {
      const s = new Sham3();
      expect(() => s.setChain('fakenet')).toThrow('Unknown chain');
    });
  });

  // ================================================================
  // Address Module
  // ================================================================

  describe('address', () => {
    let s: Sham3;
    beforeEach(() => { s = new Sham3({ seed: 42 }); });

    it('generates valid EVM wallet address', () => {
      const addr = s.address.wallet();
      expect(addr).toMatch(/^0x[0-9a-fA-F]{40}$/);
    });

    it('generates contract addresses', () => {
      const addr = s.address.contract();
      expect(addr).toMatch(/^0x[0-9a-fA-F]{40}$/);
    });

    it('generates zero address', () => {
      expect(s.address.zero()).toBe('0x0000000000000000000000000000000000000000');
    });

    it('generates ENS names', () => {
      const ens = s.address.ens();
      expect(ens).toMatch(/\.eth$/);
      expect(ens.length).toBeGreaterThan(4);
    });

    it('generates Solana addresses', () => {
      const addr = s.address.solana();
      expect(addr.length).toBeGreaterThan(30);
      expect(addr).toMatch(/^[1-9A-HJ-NP-Za-km-z]+$/);
    });

    it('generates chain-appropriate addresses', () => {
      s.setChain('ethereum');
      expect(s.address.any()).toMatch(/^0x/);

      s.setChain('solana');
      expect(s.address.any()).not.toMatch(/^0x/);
    });

    it('generates multiple unique wallets', () => {
      const wallets = s.address.wallets(100);
      expect(wallets.length).toBe(100);
      expect(new Set(wallets).size).toBe(100); // all unique
    });
  });

  // ================================================================
  // Token Module
  // ================================================================

  describe('token', () => {
    let s: Sham3;
    beforeEach(() => { s = new Sham3({ seed: 42 }); });

    it('generates token symbols', () => {
      const sym = s.token.symbol();
      expect(sym.length).toBeGreaterThanOrEqual(3);
      expect(sym.length).toBeLessThanOrEqual(5);
      expect(sym).toBe(sym.toUpperCase());
    });

    it('generates token names', () => {
      const name = s.token.name();
      expect(name.length).toBeGreaterThan(2);
    });

    it('generates full ERC-20 token info', () => {
      const token = s.token.erc20();
      expect(token.name).toBeTruthy();
      expect(token.symbol).toBeTruthy();
      expect([6, 8, 9, 18]).toContain(token.decimals);
      expect(BigInt(token.totalSupply)).toBeGreaterThan(0n);
      expect(token.address).toMatch(/^0x/);
    });

    it('generates token balances', () => {
      const bal = s.token.balance();
      expect(bal.token).toBeDefined();
      expect(BigInt(bal.balance)).toBeGreaterThanOrEqual(0n);
      expect(bal.valueUsd).toBeGreaterThanOrEqual(0);
    });

    it('generates token prices', () => {
      const price = s.token.price();
      expect(price).toBeGreaterThan(0);
    });

    it('generates token pairs', () => {
      const pair = s.token.pair();
      expect(pair.token0).toBeDefined();
      expect(pair.token1).toBeDefined();
      expect(pair.token0.symbol).not.toBe(pair.token1.symbol);
    });
  });

  // ================================================================
  // NFT Module
  // ================================================================

  describe('nft', () => {
    let s: Sham3;
    beforeEach(() => { s = new Sham3({ seed: 42 }); });

    it('generates NFT traits', () => {
      const trait = s.nft.trait();
      expect(trait.trait_type).toBeTruthy();
      expect(trait.value).toBeTruthy();
    });

    it('generates multiple traits', () => {
      const traits = s.nft.traits(6);
      expect(traits.length).toBe(6);
      traits.forEach(t => {
        expect(t.trait_type).toBeTruthy();
        expect(t.value).toBeTruthy();
      });
    });

    it('generates collection names', () => {
      const name = s.nft.collectionName();
      expect(name.split(' ').length).toBeGreaterThanOrEqual(2);
    });

    it('generates IPFS CIDs', () => {
      const cid = s.nft.ipfsCid();
      expect(cid).toMatch(/^Qm[0-9a-f]{44}$/);
    });

    it('generates full NFT metadata', () => {
      const meta = s.nft.metadata();
      expect(meta.name).toBeTruthy();
      expect(meta.description).toBeTruthy();
      expect(meta.image).toMatch(/^ipfs:\/\//);
      expect(meta.attributes.length).toBeGreaterThan(0);
    });

    it('generates Solana NFT metadata with properties', () => {
      s.setChain('solana');
      const meta = s.nft.metadata();
      expect(meta.properties).toBeDefined();
      expect(meta.properties!.creators.length).toBeGreaterThan(0);
    });

    it('generates full collections', () => {
      const col = s.nft.collection(10);
      expect(col.name).toBeTruthy();
      expect(col.symbol).toBeTruthy();
      expect(col.items.length).toBe(10);
      expect(col.royaltyBps).toBeGreaterThan(0);
      expect(col.floorPrice).toBeGreaterThan(0);
    });
  });

  // ================================================================
  // Transaction Module
  // ================================================================

  describe('transaction', () => {
    let s: Sham3;
    beforeEach(() => { s = new Sham3({ seed: 42 }); });

    it('generates transaction hashes', () => {
      const hash = s.transaction.hash();
      expect(hash).toMatch(/^0x[0-9a-f]{64}$/);
    });

    it('generates Solana signatures', () => {
      s.setChain('solana');
      const sig = s.transaction.hash();
      expect(sig.length).toBe(88);
    });

    it('generates full EVM transactions', () => {
      const tx = s.transaction.evm();
      expect(tx.hash).toMatch(/^0x/);
      expect(tx.from).toMatch(/^0x/);
      expect(tx.to).toMatch(/^0x/);
      expect(tx.blockNumber).toBeGreaterThan(0);
      expect(tx.gasUsed).toBeGreaterThan(0);
      expect([0, 1]).toContain(tx.status);
    });

    it('generates transaction receipts with logs', () => {
      const receipt = s.transaction.receipt();
      expect(receipt.transactionHash).toMatch(/^0x/);
      expect(Array.isArray(receipt.logs)).toBe(true);
      expect([0, 1]).toContain(receipt.status);
    });

    it('generates Solana transactions', () => {
      s.setChain('solana');
      const tx = s.transaction.solana();
      expect(tx.signature.length).toBe(88);
      expect(tx.instructions.length).toBeGreaterThan(0);
      expect(['success', 'failed']).toContain(tx.status);
    });

    it('generates gas prices in realistic range', () => {
      const price = s.transaction.gasPrice();
      const gwei = Number(BigInt(price)) / 1e9;
      expect(gwei).toBeGreaterThanOrEqual(5);
      expect(gwei).toBeLessThanOrEqual(200);
    });
  });

  // ================================================================
  // DEX Module
  // ================================================================

  describe('dex', () => {
    let s: Sham3;
    beforeEach(() => { s = new Sham3({ seed: 42 }); });

    it('generates OHLCV candles', () => {
      const candles = s.dex.candles(50);
      expect(candles.length).toBe(50);
      candles.forEach(c => {
        expect(c.high).toBeGreaterThanOrEqual(c.low);
        expect(c.high).toBeGreaterThanOrEqual(c.open);
        expect(c.high).toBeGreaterThanOrEqual(c.close);
        expect(c.low).toBeLessThanOrEqual(c.open);
        expect(c.low).toBeLessThanOrEqual(c.close);
        expect(c.volume).toBeGreaterThan(0);
      });
    });

    it('candles timestamps are sequential', () => {
      const candles = s.dex.candles(20, { interval: '1h' });
      for (let i = 1; i < candles.length; i++) {
        expect(candles[i].timestamp).toBe(candles[i - 1].timestamp + 3600);
      }
    });

    it('generates swap events', () => {
      const swap = s.dex.swap();
      expect(['buy', 'sell']).toContain(swap.side);
      expect(swap.txHash).toMatch(/^0x/);
      expect(swap.price).toBeGreaterThan(0);
    });

    it('generates order books', () => {
      const ob = s.dex.orderBook({ midPrice: 2000 });
      expect(ob.bids.length).toBeGreaterThan(0);
      expect(ob.asks.length).toBeGreaterThan(0);
      expect(ob.bids[0].price).toBeLessThan(ob.asks[0].price);
      expect(ob.spread).toBeGreaterThan(0);
    });

    it('generates liquidity pools', () => {
      const pool = s.dex.pool();
      expect(pool.dex).toBeTruthy();
      expect(pool.pair).toBeTruthy();
      expect(pool.fee).toBeGreaterThan(0);
      expect(pool.apr).toBeGreaterThan(0);
    });
  });

  // ================================================================
  // DAO Module
  // ================================================================

  describe('dao', () => {
    let s: Sham3;
    beforeEach(() => { s = new Sham3({ seed: 42 }); });

    it('generates proposals', () => {
      const p = s.dao.proposal();
      expect(p.title).toBeTruthy();
      expect(p.proposer).toMatch(/^0x/);
      expect(BigInt(p.forVotes)).toBeGreaterThanOrEqual(0n);
    });

    it('generates votes', () => {
      const v = s.dao.vote();
      expect([0, 1, 2]).toContain(v.support);
      expect(v.voter).toMatch(/^0x/);
      expect(BigInt(v.weight)).toBeGreaterThan(0n);
    });

    it('generates full elections', () => {
      const election = s.dao.election(2, 50);
      expect(election.proposals.length).toBe(2);
      expect(election.votes.length).toBe(100);
    });

    it('generates delegates', () => {
      const d = s.dao.delegate();
      expect(d.address).toMatch(/^0x/);
      expect(d.votingParticipation).toBeGreaterThanOrEqual(0);
      expect(d.votingParticipation).toBeLessThanOrEqual(1);
    });
  });

  // ================================================================
  // DeFi Module
  // ================================================================

  describe('defi', () => {
    let s: Sham3;
    beforeEach(() => { s = new Sham3({ seed: 42 }); });

    it('generates lending positions', () => {
      const pos = s.defi.lendingPosition();
      expect(['supply', 'borrow']).toContain(pos.type);
      expect(pos.apy).toBeGreaterThan(0);
    });

    it('generates staking positions', () => {
      const pos = s.defi.stakingPosition();
      expect(parseFloat(pos.stakedAmount)).toBeGreaterThan(0);
      expect(pos.apy).toBeGreaterThan(0);
    });

    it('generates yield vaults', () => {
      const vault = s.defi.vault();
      expect(vault.tvl).toBeGreaterThan(0);
      expect(vault.apy).toBeGreaterThan(0);
    });

    it('generates airdrop claims', () => {
      const claims = s.defi.airdrop(10);
      expect(claims.length).toBe(10);
      claims.forEach(c => {
        expect(c.recipient).toMatch(/^0x/);
        expect(c.proof.length).toBeGreaterThan(0);
        expect(typeof c.claimed).toBe('boolean');
      });
    });

    it('generates vesting schedules', () => {
      const vest = s.defi.vestingSchedule();
      expect(vest.beneficiary).toMatch(/^0x/);
      expect(vest.schedule.length).toBeGreaterThan(0);
      expect(vest.schedule[vest.schedule.length - 1].percentage).toBe(100);
    });
  });

  // ================================================================
  // Contract Module
  // ================================================================

  describe('contract', () => {
    let s: Sham3;
    beforeEach(() => { s = new Sham3({ seed: 42 }); });

    it('generates ABIs', () => {
      const abi = s.contract.abi();
      expect(abi.length).toBeGreaterThan(0);
      const types = abi.map(e => e.type);
      expect(types).toContain('function');
      expect(types).toContain('constructor');
    });

    it('generates standard ERC-20 ABI', () => {
      const abi = s.contract.erc20Abi();
      const names = abi.filter(e => e.name).map(e => e.name);
      expect(names).toContain('transfer');
      expect(names).toContain('approve');
      expect(names).toContain('balanceOf');
      expect(names).toContain('Transfer');
    });

    it('generates contract info', () => {
      const info = s.contract.info();
      expect(info.address).toMatch(/^0x/);
      expect(info.deployer).toMatch(/^0x/);
      expect(info.abi.length).toBeGreaterThan(0);
      expect(typeof info.verified).toBe('boolean');
    });

    it('generates bytecode', () => {
      const code = s.contract.bytecode(64);
      expect(code).toMatch(/^0x[0-9a-f]{128}$/);
    });
  });

  // ================================================================
  // Signature Module
  // ================================================================

  describe('signature', () => {
    let s: Sham3;
    beforeEach(() => { s = new Sham3({ seed: 42 }); });

    it('generates raw signatures', () => {
      const sig = s.signature.raw();
      expect(sig.length).toBe(132); // 0x + 64 + 64 + 2
    });

    it('generates personal signed messages', () => {
      const signed = s.signature.personal();
      expect(signed.message).toBeTruthy();
      expect(signed.signer).toMatch(/^0x/);
      expect([27, 28]).toContain(signed.v);
    });

    it('generates EIP-712 permit data', () => {
      const typed = s.signature.eip712('permit');
      expect(typed.primaryType).toBe('Permit');
      expect(typed.domain.chainId).toBe(1);
      expect(typed.types.Permit).toBeDefined();
    });

    it('generates EIP-712 order data', () => {
      const typed = s.signature.eip712('order');
      expect(typed.primaryType).toBe('Order');
      expect(typed.types.Order).toBeDefined();
    });
  });

  // ================================================================
  // Scenario Module
  // ================================================================

  describe('scenario', () => {
    let s: Sham3;
    beforeEach(() => { s = new Sham3({ seed: 42 }); });

    it('generates NFT drop', () => {
      const drop = s.scenario.nftDrop(10);
      expect(drop.items.length).toBe(10);
      expect(drop.name).toBeTruthy();
    });

    it('generates DAO election', () => {
      const election = s.scenario.daoElection(2, 50);
      expect(election.proposals.length).toBe(2);
      expect(election.votes.length).toBe(100);
      expect(election.delegates.length).toBeGreaterThan(0);
      expect(election.config.name).toBeTruthy();
    });

    it('generates DEX trading data', () => {
      const trading = s.scenario.dexTrading(50);
      expect(trading.candles.length).toBe(50);
      expect(trading.trades.length).toBe(100);
      expect(trading.pool).toBeDefined();
      expect(trading.orderBook).toBeDefined();
    });

    it('generates wallet portfolio', () => {
      const portfolio = s.scenario.walletPortfolio();
      expect(portfolio.address).toBeTruthy();
      expect(portfolio.tokens.length).toBeGreaterThan(0);
      expect(portfolio.totalValueUsd).toBeGreaterThan(0);
    });

    it('generates airdrop scenario', () => {
      const drop = s.scenario.airdrop(50);
      expect(drop.token).toBeDefined();
      expect(drop.claims.length).toBe(50);
      expect(drop.merkleRoot).toMatch(/^0x/);
    });
  });

  // ================================================================
  // Helpers
  // ================================================================

  describe('helpers', () => {
    it('generates multiple items', () => {
      const s = new Sham3({ seed: 42 });
      const wallets = s.helpers.multiple(() => s.address.wallet(), { count: 5 });
      expect(wallets.length).toBe(5);
      wallets.forEach(w => expect(w).toMatch(/^0x/));
    });
  });

  // ================================================================
  // Cross-chain
  // ================================================================

  describe('cross-chain', () => {
    it('switches between chains', () => {
      const s = new Sham3({ seed: 42 });

      s.setChain('ethereum');
      const ethAddr = s.address.any();
      expect(ethAddr).toMatch(/^0x/);

      s.setChain('solana');
      const solAddr = s.address.any();
      expect(solAddr).not.toMatch(/^0x/);
    });
  });
});
