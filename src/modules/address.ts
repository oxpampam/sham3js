import { BaseModule } from '../core/base-module.js';
import { keccak256 } from '../core/keccak.js';
import { ENS_WORDS } from '../data/pools.js';

/**
 * sham.address - Generate fake blockchain addresses
 *
 * @example
 * sham.address.wallet()        // '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28'
 * sham.address.contract()      // '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
 * sham.address.ens()           // 'degenwhale.eth'
 * sham.address.solana()        // '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
 */
export class AddressModule extends BaseModule {

  /** Generate a random EVM wallet address (EIP-55 mixed-case checksum) */
  wallet(): string {
    const bytes = new Uint8Array(20);
    for (let i = 0; i < 20; i++) {
      bytes[i] = this.rng.int(0, 255);
    }
    return this.toChecksumAddress(bytes);
  }

  /** Generate a random EVM contract address (deterministic from deployer + nonce) */
  contract(): string {
    // Contract addresses look the same as wallets but we can mark them
    return this.wallet();
  }

  /** Generate a zero address */
  zero(): string {
    if (this.isSolana) return '11111111111111111111111111111111';
    return '0x0000000000000000000000000000000000000000';
  }

  /** Generate a dead/burn address */
  dead(): string {
    if (this.isSolana) return '1nc1nerator11111111111111111111111111111111';
    return this.rng.chance(0.5)
      ? '0x000000000000000000000000000000000000dEaD'
      : '0x0000000000000000000000000000000000000000';
  }

  /** Generate an ENS name */
  ens(): string {
    const wordCount = this.rng.int(1, 3);
    const words: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      words.push(this.rng.pick(ENS_WORDS));
    }
    if (this.rng.chance(0.3)) {
      words.push(this.rng.int(0, 9999).toString());
    }
    return words.join('') + '.eth';
  }

  /** Generate a Solana base58 address (32 bytes) */
  solana(): string {
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      bytes[i] = this.rng.int(0, 255);
    }
    return this.base58Encode(bytes);
  }

  /** Generate an address appropriate for the current chain */
  any(): string {
    if (this.isSolana) return this.solana();
    return this.wallet();
  }

  /** Generate multiple unique addresses */
  wallets(count: number): string[] {
    const set = new Set<string>();
    while (set.size < count) {
      set.add(this.any());
    }
    return Array.from(set);
  }

  // -- Internal helpers --

  private toChecksumAddress(bytes: Uint8Array): string {
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const hashInput = new TextEncoder().encode(hex);
    const hash = keccak256(hashInput);
    const hashHex = Array.from(hash)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    let checksummed = '0x';
    for (let i = 0; i < 40; i++) {
      const hashNibble = parseInt(hashHex[i], 16);
      checksummed += hashNibble >= 8 ? hex[i].toUpperCase() : hex[i];
    }
    return checksummed;
  }

  private base58Encode(bytes: Uint8Array): string {
    const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let num = 0n;
    for (const byte of bytes) {
      num = num * 256n + BigInt(byte);
    }

    let encoded = '';
    while (num > 0n) {
      const remainder = Number(num % 58n);
      num = num / 58n;
      encoded = ALPHABET[remainder] + encoded;
    }

    // Leading zeros
    for (const byte of bytes) {
      if (byte === 0) encoded = '1' + encoded;
      else break;
    }

    return encoded;
  }
}
