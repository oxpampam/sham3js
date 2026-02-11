/**
 * sham3js - Seeded Pseudorandom Number Generator
 *
 * Uses a Mulberry32 PRNG for fast, deterministic output.
 * All randomness in sham3js flows through this single source.
 */

export class PRNG {
  private state: number;

  constructor(seed: number = Date.now()) {
    this.state = seed | 0;
  }

  seed(value: number): void {
    this.state = value | 0;
  }

  /** Returns a float in [0, 1) */
  next(): number {
    this.state |= 0;
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns an integer in [min, max] inclusive */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Returns a float in [min, max) */
  float(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /** Returns a bigint with the specified number of bytes */
  bigint(bytes: number): bigint {
    let result = 0n;
    for (let i = 0; i < bytes; i++) {
      result = (result << 8n) | BigInt(this.int(0, 255));
    }
    return result;
  }

  /** Pick a random element from an array */
  pick<T>(arr: readonly T[]): T {
    return arr[this.int(0, arr.length - 1)];
  }

  /** Pick N unique random elements from an array */
  pickMultiple<T>(arr: readonly T[], count: number): T[] {
    const copy = [...arr];
    const result: T[] = [];
    const n = Math.min(count, copy.length);
    for (let i = 0; i < n; i++) {
      const idx = this.int(0, copy.length - 1);
      result.push(copy[idx]);
      copy.splice(idx, 1);
    }
    return result;
  }

  /** Shuffle an array in place (Fisher-Yates) */
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /** Returns true with given probability (0-1) */
  chance(probability: number): boolean {
    return this.next() < probability;
  }

  /** Generate a hex string of given byte length */
  hex(bytes: number): string {
    let result = '';
    for (let i = 0; i < bytes; i++) {
      result += this.int(0, 255).toString(16).padStart(2, '0');
    }
    return result;
  }

  /** Weighted random selection */
  weighted<T>(items: readonly T[], weights: readonly number[]): T {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = this.next() * totalWeight;
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  /** Gaussian (normal) distribution using Box-Muller */
  gaussian(mean: number = 0, stddev: number = 1): number {
    const u1 = this.next();
    const u2 = this.next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z * stddev + mean;
  }

  /** Power-law / Zipf-like distribution - returns value in [min, max] */
  powerLaw(min: number, max: number, alpha: number = 1.5): number {
    const u = this.next();
    const minA = Math.pow(min, 1 - alpha);
    const maxA = Math.pow(max, 1 - alpha);
    return Math.pow(minA + u * (maxA - minA), 1 / (1 - alpha));
  }
}
