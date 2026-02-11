import { BaseModule } from '../core/base-module.js';

export interface SignedMessage {
  message: string;
  signature: string;
  signer: string;
  v: number;
  r: string;
  s: string;
}

export interface EIP712TypedData {
  types: Record<string, { name: string; type: string }[]>;
  primaryType: string;
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  message: Record<string, unknown>;
}

/**
 * sham.signature - Generate fake signatures and signed data
 *
 * @example
 * sham.signature.personal()     // Personal signed message
 * sham.signature.eip712()       // EIP-712 typed data
 * sham.signature.raw()          // Raw 65-byte signature
 */
export class SignatureModule extends BaseModule {

  /** Generate a raw 65-byte ECDSA signature */
  raw(): string {
    const r = '0x' + this.rng.hex(32);
    const s = '0x' + this.rng.hex(32);
    const v = this.rng.pick([27, 28]);
    return r + s.slice(2) + v.toString(16);
  }

  /** Generate r, s, v components */
  components(): { r: string; s: string; v: number } {
    return {
      r: '0x' + this.rng.hex(32),
      s: '0x' + this.rng.hex(32),
      v: this.rng.pick([27, 28]),
    };
  }

  /** Generate a personal signed message */
  personal(message?: string): SignedMessage {
    const msg = message ?? this.rng.pick([
      'Sign this message to verify your wallet ownership.',
      'Welcome to the dApp! Please sign to authenticate.',
      `Nonce: ${this.rng.hex(16)}`,
      `Login to ${this.rng.pick(['OpenSea', 'Uniswap', 'Aave', 'Compound'])} - ${new Date().toISOString()}`,
    ]);

    const { r, s, v } = this.components();

    return {
      message: msg,
      signature: r + s.slice(2) + v.toString(16),
      signer: '0x' + this.rng.hex(20),
      v,
      r,
      s,
    };
  }

  /** Generate EIP-712 typed data (permit, order, etc.) */
  eip712(type?: 'permit' | 'order' | 'vote'): EIP712TypedData {
    const chainId = this.chain.chainId ?? 1;

    if (type === 'permit' || (!type && this.rng.chance(0.33))) {
      return {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Permit: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
          ],
        },
        primaryType: 'Permit',
        domain: {
          name: this.rng.pick(['USDC', 'DAI', 'WETH']),
          version: '1',
          chainId,
          verifyingContract: '0x' + this.rng.hex(20),
        },
        message: {
          owner: '0x' + this.rng.hex(20),
          spender: '0x' + this.rng.hex(20),
          value: (BigInt(this.rng.int(1, 1_000_000)) * BigInt(1e18)).toString(),
          nonce: this.rng.int(0, 100),
          deadline: Math.floor(Date.now() / 1000) + 3600,
        },
      };
    }

    if (type === 'order') {
      return {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Order: [
            { name: 'maker', type: 'address' },
            { name: 'taker', type: 'address' },
            { name: 'makerToken', type: 'address' },
            { name: 'takerToken', type: 'address' },
            { name: 'makerAmount', type: 'uint256' },
            { name: 'takerAmount', type: 'uint256' },
            { name: 'expiry', type: 'uint256' },
            { name: 'salt', type: 'uint256' },
          ],
        },
        primaryType: 'Order',
        domain: {
          name: 'Exchange',
          version: '4',
          chainId,
          verifyingContract: '0x' + this.rng.hex(20),
        },
        message: {
          maker: '0x' + this.rng.hex(20),
          taker: '0x0000000000000000000000000000000000000000',
          makerToken: '0x' + this.rng.hex(20),
          takerToken: '0x' + this.rng.hex(20),
          makerAmount: (BigInt(this.rng.int(1, 100)) * BigInt(1e18)).toString(),
          takerAmount: (BigInt(this.rng.int(100, 100_000)) * BigInt(1e6)).toString(),
          expiry: Math.floor(Date.now() / 1000) + 86400,
          salt: this.rng.bigint(32).toString(),
        },
      };
    }

    // Vote
    return {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Ballot: [
          { name: 'proposalId', type: 'uint256' },
          { name: 'support', type: 'uint8' },
        ],
      },
      primaryType: 'Ballot',
      domain: {
        name: 'Governor',
        version: '1',
        chainId,
        verifyingContract: '0x' + this.rng.hex(20),
      },
      message: {
        proposalId: this.rng.int(1, 500),
        support: this.rng.pick([0, 1, 2]),
      },
    };
  }
}
