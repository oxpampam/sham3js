/**
 * Minimal Keccak-256 implementation (pure JS, zero dependencies).
 * Used to generate EIP-55 checksummed addresses and realistic tx hashes.
 */

const RC = [
  0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an,
  0x8000000080008000n, 0x000000000000808bn, 0x0000000080000001n,
  0x8000000080008081n, 0x8000000000008009n, 0x000000000000008an,
  0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
  0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n,
  0x8000000000008003n, 0x8000000000008002n, 0x8000000000000080n,
  0x000000000000800an, 0x800000008000000an, 0x8000000080008081n,
  0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
];

const ROTC = [
  1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 2, 14,
  27, 41, 56, 8, 25, 43, 62, 18, 39, 61, 20, 44,
];

const PI = [
  10, 7, 11, 17, 18, 3, 5, 16, 8, 21, 24, 4,
  15, 23, 19, 13, 12, 2, 20, 14, 22, 9, 6, 1,
];

function keccakF(state: bigint[]): void {
  for (let round = 0; round < 24; round++) {
    // Theta
    const C: bigint[] = [];
    for (let x = 0; x < 5; x++) {
      C[x] = state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20];
    }
    for (let x = 0; x < 5; x++) {
      const D = C[(x + 4) % 5] ^ rotl64(C[(x + 1) % 5], 1n);
      for (let y = 0; y < 25; y += 5) {
        state[x + y] ^= D;
      }
    }
    // Rho + Pi
    let last = state[1];
    for (let i = 0; i < 24; i++) {
      const j = PI[i];
      const temp = state[j];
      state[j] = rotl64(last, BigInt(ROTC[i]));
      last = temp;
    }
    // Chi
    for (let y = 0; y < 25; y += 5) {
      const t: bigint[] = [];
      for (let x = 0; x < 5; x++) t[x] = state[y + x];
      for (let x = 0; x < 5; x++) {
        state[y + x] = t[x] ^ (~t[(x + 1) % 5] & t[(x + 2) % 5]);
      }
    }
    // Iota
    state[0] ^= RC[round];
  }
}

function rotl64(x: bigint, n: bigint): bigint {
  return ((x << n) | (x >> (64n - n))) & 0xffffffffffffffffn;
}

export function keccak256(input: Uint8Array): Uint8Array {
  const rate = 136; // 1088 bits for keccak-256
  const state = new Array<bigint>(25).fill(0n);

  // Padding
  const padded = new Uint8Array(Math.ceil((input.length + 1) / rate) * rate);
  padded.set(input);
  padded[input.length] = 0x01;
  padded[padded.length - 1] |= 0x80;

  // Absorb
  for (let offset = 0; offset < padded.length; offset += rate) {
    for (let i = 0; i < rate / 8; i++) {
      let lane = 0n;
      for (let b = 0; b < 8; b++) {
        lane |= BigInt(padded[offset + i * 8 + b]) << BigInt(b * 8);
      }
      state[i] ^= lane;
    }
    keccakF(state);
  }

  // Squeeze (32 bytes)
  const output = new Uint8Array(32);
  for (let i = 0; i < 4; i++) {
    const lane = state[i];
    for (let b = 0; b < 8; b++) {
      output[i * 8 + b] = Number((lane >> BigInt(b * 8)) & 0xffn);
    }
  }
  return output;
}

export function keccak256Hex(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const hash = keccak256(bytes);
  return Array.from(hash)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function keccak256Bytes(bytes: Uint8Array): string {
  const hash = keccak256(bytes);
  return Array.from(hash)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
