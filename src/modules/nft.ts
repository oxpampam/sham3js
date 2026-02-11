import { BaseModule } from '../core/base-module.js';
import {
  NFT_COLLECTION_ADJECTIVES,
  NFT_COLLECTION_NOUNS,
  NFT_TRAIT_CATEGORIES,
  NFT_BACKGROUNDS,
  NFT_TRAIT_VALUES,
} from '../data/pools.js';

export interface NFTTrait {
  trait_type: string;
  value: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: NFTTrait[];
  properties?: {
    category: string;
    creators: { address: string; share: number }[];
  };
}

export interface NFTCollection {
  name: string;
  symbol: string;
  description: string;
  totalSupply: number;
  contractAddress: string;
  baseUri: string;
  royaltyBps: number;
  floorPrice: number;
  items: NFTMetadata[];
}

/**
 * sham.nft - Generate fake NFT metadata and collections
 *
 * @example
 * sham.nft.metadata()          // Full ERC-721 metadata JSON
 * sham.nft.collection(100)     // 100 NFTs with shared collection traits
 * sham.nft.trait()             // { trait_type: 'Background', value: 'Aquamarine' }
 */
export class NFTModule extends BaseModule {

  /** Generate a single NFT trait */
  trait(category?: string): NFTTrait {
    const traitType = category ?? this.rng.pick(NFT_TRAIT_CATEGORIES);
    let value: string;

    if (traitType === 'Background') {
      value = this.rng.pick(NFT_BACKGROUNDS);
    } else if (NFT_TRAIT_VALUES[traitType]) {
      value = this.rng.pick(NFT_TRAIT_VALUES[traitType]);
    } else {
      // Generate a generic trait value
      const adjectives = ['Rare', 'Common', 'Epic', 'Legendary', 'Mythic', 'Ancient', 'Glowing', 'Dark', 'Light', 'Twisted'];
      value = this.rng.pick(adjectives) + ' ' + traitType;
    }

    return { trait_type: traitType, value };
  }

  /** Generate a set of traits for an NFT */
  traits(count?: number): NFTTrait[] {
    const n = count ?? this.rng.int(4, 8);
    const categories = this.rng.pickMultiple(NFT_TRAIT_CATEGORIES, n);
    return categories.map((c) => this.trait(c));
  }

  /** Generate a collection name */
  collectionName(): string {
    const adj = this.rng.pick(NFT_COLLECTION_ADJECTIVES);
    const noun = this.rng.pick(NFT_COLLECTION_NOUNS);
    return `${adj} ${noun}`;
  }

  /** Generate an IPFS-like CID */
  ipfsCid(): string {
    return 'Qm' + this.rng.hex(22);
  }

  /** Generate an IPFS image URL */
  imageUrl(tokenId?: number): string {
    const cid = this.ipfsCid();
    const id = tokenId ?? this.rng.int(1, 10000);
    return `ipfs://${cid}/${id}.png`;
  }

  /** Generate an Arweave URL */
  arweaveUrl(): string {
    return `ar://${this.rng.hex(32)}`;
  }

  /** Generate full ERC-721/Metaplex-compatible metadata */
  metadata(opts?: {
    tokenId?: number;
    collectionName?: string;
    traitCount?: number;
  }): NFTMetadata {
    const collection = opts?.collectionName ?? this.collectionName();
    const tokenId = opts?.tokenId ?? this.rng.int(1, 10000);
    const traits = this.traits(opts?.traitCount);

    const metadata: NFTMetadata = {
      name: `${collection} #${tokenId}`,
      description: `A unique ${collection} NFT. Part of a collection of ${this.rng.pick(['10,000', '5,000', '8,888', '3,333', '7,777'])} unique digital collectibles.`,
      image: this.imageUrl(tokenId),
      external_url: `https://${collection.toLowerCase().replace(/\s/g, '')}.xyz/token/${tokenId}`,
      attributes: traits,
    };

    // Add Solana/Metaplex specific properties
    if (this.isSolana) {
      metadata.properties = {
        category: 'image',
        creators: [
          { address: this.solanaAddress(), share: this.rng.int(85, 100) },
          { address: this.solanaAddress(), share: this.rng.int(0, 15) },
        ],
      };
    }

    return metadata;
  }

  /** Generate a full NFT collection with consistent traits */
  collection(size: number = 100, opts?: {
    name?: string;
    traitCount?: number;
  }): NFTCollection {
    const name = opts?.name ?? this.collectionName();
    const symbol = name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase();

    const baseUri = `ipfs://${this.ipfsCid()}/`;
    const floorPrice = this.rng.float(0.01, 100);

    const items: NFTMetadata[] = [];
    for (let i = 0; i < size; i++) {
      items.push(this.metadata({
        tokenId: i + 1,
        collectionName: name,
        traitCount: opts?.traitCount,
      }));
    }

    return {
      name,
      symbol,
      description: `${name} is a collection of ${size} unique NFTs living on the blockchain.`,
      totalSupply: size,
      contractAddress: this.isEvm ? '0x' + this.rng.hex(20) : this.solanaAddress(),
      baseUri,
      royaltyBps: this.rng.pick([250, 500, 750, 1000]),
      floorPrice: parseFloat(floorPrice.toFixed(4)),
      items,
    };
  }

  /** Generate royalty info */
  royalty(): { receiver: string; bps: number; percentage: string } {
    const bps = this.rng.pick([100, 250, 500, 750, 1000, 1500, 2000]);
    return {
      receiver: this.isEvm ? '0x' + this.rng.hex(20) : this.solanaAddress(),
      bps,
      percentage: (bps / 100).toFixed(1) + '%',
    };
  }

  // -- helpers --

  private solanaAddress(): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let addr = '';
    for (let i = 0; i < 44; i++) {
      addr += chars[this.rng.int(0, chars.length - 1)];
    }
    return addr;
  }
}
