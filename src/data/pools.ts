// ============================================================
// sham3js static data pools
// ============================================================

export const TOKEN_NAMES: readonly string[] = [
  'Aether', 'Blaze', 'Catalyst', 'Drift', 'Echo', 'Flux', 'Glyph',
  'Helix', 'Ion', 'Jade', 'Krypton', 'Luna', 'Mist', 'Nexus', 'Onyx',
  'Prism', 'Quartz', 'Rift', 'Spark', 'Titan', 'Umbra', 'Vortex',
  'Warp', 'Xenon', 'Yield', 'Zephyr', 'Apex', 'Bolt', 'Core', 'Dawn',
  'Ember', 'Fuse', 'Glint', 'Halo', 'Iris', 'Jolt', 'Karma', 'Lux',
  'Mint', 'Nova', 'Orbit', 'Pulse', 'Radiant', 'Surge', 'Thorn',
  'Unity', 'Vertex', 'Wave', 'Axiom', 'Bloom',
];

export const TOKEN_SUFFIXES: readonly string[] = [
  'Token', 'Coin', 'Protocol', 'Network', 'Finance', 'DAO', 'Chain',
  'Swap', 'Bridge', 'Vault', 'Labs', 'AI', 'Fi', '',
];

export const STABLECOIN_NAMES: readonly string[] = [
  'USDC', 'USDT', 'DAI', 'FRAX', 'LUSD', 'GUSD', 'TUSD', 'BUSD',
  'UST', 'sUSD', 'RAI', 'DOLA', 'MIM', 'USDP', 'crvUSD', 'GHO',
  'PYUSD', 'USDe',
];

export const NFT_COLLECTION_ADJECTIVES: readonly string[] = [
  'Bored', 'Mutant', 'Degen', 'Based', 'Cosmic', 'Cyber', 'Mystic',
  'Pixel', 'Quantum', 'Astral', 'Neon', 'Shadow', 'Crystal', 'Void',
  'Solar', 'Lunar', 'Hyper', 'Meta', 'Ethereal', 'Phantom', 'Galactic',
  'Frozen', 'Flaming', 'Ancient', 'Digital', 'Holographic',
];

export const NFT_COLLECTION_NOUNS: readonly string[] = [
  'Apes', 'Punks', 'Cats', 'Bears', 'Penguins', 'Skulls', 'Wizards',
  'Warriors', 'Dragons', 'Foxes', 'Wolves', 'Robots', 'Aliens', 'Ghosts',
  'Knights', 'Samurai', 'Pirates', 'Demons', 'Angels', 'Pandas',
  'Owls', 'Frogs', 'Llamas', 'Monsters', 'Legends', 'Spirits',
];

export const NFT_TRAIT_CATEGORIES: readonly string[] = [
  'Background', 'Skin', 'Eyes', 'Mouth', 'Hat', 'Clothing', 'Accessory',
  'Earring', 'Fur', 'Expression', 'Weapon', 'Aura', 'Companion',
];

export const NFT_BACKGROUNDS: readonly string[] = [
  'Aquamarine', 'Army Green', 'Blue', 'Gray', 'New Punk Blue', 'Orange',
  'Purple', 'Yellow', 'Red', 'Teal', 'Gradient Sunset', 'Dark Void',
  'Neon Grid', 'Starfield', 'Forest', 'Ocean', 'Desert', 'Mountain',
];

export const NFT_TRAIT_VALUES: Record<string, readonly string[]> = {
  Skin: ['Pale', 'Tan', 'Brown', 'Dark', 'Zombie', 'Robot', 'Gold', 'Diamond', 'Alien Green', 'Ghost White'],
  Eyes: ['Bored', 'Angry', 'Sad', 'Laser', 'Heart', 'Closed', 'Cyborg', 'Hypnotized', '3D', 'Coins', 'X-Ray'],
  Mouth: ['Grin', 'Bored', 'Tongue Out', 'Dumbfounded', 'Phoneme Vuh', 'Rage', 'Smile', 'Discomfort'],
  Hat: ['Beanie', 'Cowboy', 'Crown', 'Fez', 'Fisherman', 'Halo', 'Horns', 'Party Hat', 'Sushi Chef', 'None'],
  Clothing: ['Hoodie', 'Leather Jacket', 'Suit', 'Hawaiian Shirt', 'Tank Top', 'Toga', 'Lab Coat', 'None'],
  Accessory: ['Gold Chain', 'Silver Earring', 'Monocle', 'Scar', 'Bandana', 'Cigar', 'None'],
};

export const DEX_NAMES: readonly string[] = [
  'Uniswap', 'SushiSwap', 'PancakeSwap', 'Curve', 'Balancer',
  'dYdX', 'Raydium', 'Orca', 'Jupiter', 'Trader Joe',
  'QuickSwap', 'Velodrome', 'Aerodrome', 'Camelot', 'Maverick',
];

export const PROTOCOL_NAMES: readonly string[] = [
  'Aave', 'Compound', 'MakerDAO', 'Lido', 'Rocket Pool', 'Eigenlayer',
  'Pendle', 'Morpho', 'Yearn', 'Convex', 'Frax', 'Instadapp',
  'Spark', 'Ethena', 'Jito', 'Marinade', 'Tensor', 'Magic Eden',
];

export const DAO_PROPOSAL_TITLES: readonly string[] = [
  'Increase Treasury Diversification to Stablecoins',
  'Grant Funding for Developer Tooling',
  'Reduce Emission Rate by 15%',
  'Add New Liquidity Mining Incentives',
  'Upgrade Governance Contract to v2',
  'Fund Security Audit for Core Contracts',
  'Establish Bug Bounty Program',
  'Partner with {protocol} for Cross-Protocol Integration',
  'Migrate Treasury to Multi-sig Wallet',
  'Implement Quadratic Voting for Grants',
  'Approve Community Marketing Budget Q{quarter}',
  'Deploy Protocol on {chain}',
  'Adjust Fee Structure for LP Providers',
  'Create Working Group for Tokenomics Review',
  'Sunset Deprecated v1 Contracts',
  'Implement Rage Quit Mechanism',
  'Add Delegation Support for Voting',
  'Fund Retroactive Public Goods',
];

export const ENS_WORDS: readonly string[] = [
  'vitalik', 'satoshi', 'degen', 'whale', 'diamond', 'moon', 'ape',
  'chad', 'wagmi', 'gm', 'ser', 'fren', 'based', 'alpha', 'sigma',
  'punk', 'dev', 'anon', 'hodl', 'yield', 'vault', 'dao', 'nft',
  'web3', 'eth', 'sol', 'defi', 'meta', 'cyber', 'crypto', 'block',
  'chain', 'node', 'mint', 'swap', 'bridge', 'stake', 'farm', 'pool',
];

export const SOLANA_PROGRAM_NAMES: readonly string[] = [
  'Token Program', 'System Program', 'Associated Token Account Program',
  'Metaplex Token Metadata', 'Serum DEX', 'Raydium AMM',
  'Marinade Finance', 'Jupiter Aggregator', 'Tensor',
  'Magic Eden', 'Orca Whirlpool', 'Switchboard Oracle',
];

export const EVM_EVENT_SIGNATURES: readonly string[] = [
  'Transfer(address,address,uint256)',
  'Approval(address,address,uint256)',
  'Swap(address,uint256,uint256,uint256,uint256,address)',
  'Mint(address,uint256,uint256)',
  'Burn(address,uint256,uint256,address)',
  'Deposit(address,uint256)',
  'Withdrawal(address,uint256)',
  'OwnershipTransferred(address,address)',
  'Upgraded(address)',
  'ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)',
  'VoteCast(address,uint256,uint8,uint256,string)',
];
