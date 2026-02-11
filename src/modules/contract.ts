import { BaseModule } from '../core/base-module.js';

export interface ABIFunction {
  type: 'function' | 'event' | 'constructor' | 'fallback' | 'receive';
  name?: string;
  inputs: ABIParam[];
  outputs?: ABIParam[];
  stateMutability?: 'pure' | 'view' | 'nonpayable' | 'payable';
  anonymous?: boolean;
  indexed?: boolean;
}

export interface ABIParam {
  name: string;
  type: string;
  indexed?: boolean;
}

export interface ContractInfo {
  address: string;
  deployer: string;
  deployTxHash: string;
  blockNumber: number;
  bytecodeHash: string;
  abi: ABIFunction[];
  verified: boolean;
  name?: string;
  compiler?: string;
}

/**
 * sham.contract - Generate fake smart contract data
 *
 * @example
 * sham.contract.abi()            // Random ABI with functions and events
 * sham.contract.erc20Abi()       // Standard ERC-20 ABI
 * sham.contract.info()           // Contract deployment info
 */
export class ContractModule extends BaseModule {

  /** Generate a random ABI parameter */
  param(indexed: boolean = false): ABIParam {
    const types = [
      'address', 'uint256', 'bool', 'bytes32', 'string',
      'uint8', 'uint128', 'int256', 'bytes', 'address[]', 'uint256[]',
    ];
    const names = [
      'owner', 'spender', 'amount', 'recipient', 'sender', 'value',
      'tokenId', 'data', 'approved', 'operator', 'from', 'to',
      'deadline', 'nonce', 'signature', 'path', 'fee', 'sqrtPriceLimitX96',
    ];

    return {
      name: this.rng.pick(names),
      type: this.rng.pick(types),
      ...(indexed ? { indexed: this.rng.chance(0.5) } : {}),
    };
  }

  /** Generate a random ABI function */
  abiFunction(): ABIFunction {
    const names = [
      'transfer', 'approve', 'transferFrom', 'mint', 'burn',
      'swap', 'deposit', 'withdraw', 'stake', 'unstake',
      'claim', 'execute', 'setApproval', 'delegate', 'vote',
      'createProposal', 'liquidate', 'flashLoan', 'addLiquidity',
    ];
    const inputCount = this.rng.int(1, 5);
    const outputCount = this.rng.int(0, 3);

    return {
      type: 'function',
      name: this.rng.pick(names),
      inputs: Array.from({ length: inputCount }, () => this.param()),
      outputs: Array.from({ length: outputCount }, () => this.param()),
      stateMutability: this.rng.pick(['pure', 'view', 'nonpayable', 'payable']),
    };
  }

  /** Generate a random ABI event */
  abiEvent(): ABIFunction {
    const names = [
      'Transfer', 'Approval', 'Swap', 'Mint', 'Burn',
      'Deposit', 'Withdrawal', 'Staked', 'Unstaked',
      'ProposalCreated', 'VoteCast', 'Claimed',
    ];

    return {
      type: 'event',
      name: this.rng.pick(names),
      inputs: Array.from({ length: this.rng.int(1, 4) }, () => this.param(true)),
      anonymous: false,
    };
  }

  /** Generate a full ABI */
  abi(opts?: { functions?: number; events?: number }): ABIFunction[] {
    const fnCount = opts?.functions ?? this.rng.int(5, 20);
    const evCount = opts?.events ?? this.rng.int(2, 8);

    const functions = Array.from({ length: fnCount }, () => this.abiFunction());
    const events = Array.from({ length: evCount }, () => this.abiEvent());
    const constructor: ABIFunction = {
      type: 'constructor',
      inputs: Array.from({ length: this.rng.int(0, 4) }, () => this.param()),
      stateMutability: 'nonpayable',
    };

    return [constructor, ...functions, ...events];
  }

  /** Generate a standard ERC-20 ABI */
  erc20Abi(): ABIFunction[] {
    return [
      { type: 'function', name: 'name', inputs: [], outputs: [{ name: '', type: 'string' }], stateMutability: 'view' },
      { type: 'function', name: 'symbol', inputs: [], outputs: [{ name: '', type: 'string' }], stateMutability: 'view' },
      { type: 'function', name: 'decimals', inputs: [], outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view' },
      { type: 'function', name: 'totalSupply', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
      { type: 'function', name: 'balanceOf', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
      { type: 'function', name: 'transfer', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
      { type: 'function', name: 'allowance', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
      { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
      { type: 'function', name: 'transferFrom', inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
      { type: 'event', name: 'Transfer', inputs: [{ name: 'from', type: 'address', indexed: true }, { name: 'to', type: 'address', indexed: true }, { name: 'value', type: 'uint256' }] },
      { type: 'event', name: 'Approval', inputs: [{ name: 'owner', type: 'address', indexed: true }, { name: 'spender', type: 'address', indexed: true }, { name: 'value', type: 'uint256' }] },
    ];
  }

  /** Generate a standard ERC-721 ABI */
  erc721Abi(): ABIFunction[] {
    return [
      { type: 'function', name: 'name', inputs: [], outputs: [{ name: '', type: 'string' }], stateMutability: 'view' },
      { type: 'function', name: 'symbol', inputs: [], outputs: [{ name: '', type: 'string' }], stateMutability: 'view' },
      { type: 'function', name: 'tokenURI', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ name: '', type: 'string' }], stateMutability: 'view' },
      { type: 'function', name: 'balanceOf', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
      { type: 'function', name: 'ownerOf', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
      { type: 'function', name: 'approve', inputs: [{ name: 'to', type: 'address' }, { name: 'tokenId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
      { type: 'function', name: 'transferFrom', inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'tokenId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
      { type: 'function', name: 'safeTransferFrom', inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'tokenId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
      { type: 'event', name: 'Transfer', inputs: [{ name: 'from', type: 'address', indexed: true }, { name: 'to', type: 'address', indexed: true }, { name: 'tokenId', type: 'uint256', indexed: true }] },
      { type: 'event', name: 'Approval', inputs: [{ name: 'owner', type: 'address', indexed: true }, { name: 'approved', type: 'address', indexed: true }, { name: 'tokenId', type: 'uint256', indexed: true }] },
    ];
  }

  /** Generate contract deployment info */
  info(): ContractInfo {
    return {
      address: '0x' + this.rng.hex(20),
      deployer: '0x' + this.rng.hex(20),
      deployTxHash: '0x' + this.rng.hex(32),
      blockNumber: this.rng.int(15_000_000, 20_000_000),
      bytecodeHash: '0x' + this.rng.hex(32),
      abi: this.abi(),
      verified: this.rng.chance(0.7),
      name: this.rng.pick(['TokenVault', 'StakingRewards', 'GovernorBravo', 'UniswapV3Pool', 'AaveLendingPool', 'NFTMarketplace']),
      compiler: `v0.8.${this.rng.int(10, 24)}+commit.${this.rng.hex(4)}`,
    };
  }

  /** Generate fake bytecode */
  bytecode(length: number = 1024): string {
    return '0x' + this.rng.hex(length);
  }

  /** Generate a function selector (4 bytes) */
  selector(): string {
    return '0x' + this.rng.hex(4);
  }
}
