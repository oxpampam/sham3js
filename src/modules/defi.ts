import { BaseModule } from '../core/base-module.js';
import { PROTOCOL_NAMES } from '../data/pools.js';

export interface LendingPosition {
  protocol: string;
  asset: string;
  type: 'supply' | 'borrow';
  amount: string;
  amountUsd: number;
  apy: number;
  healthFactor?: number;
  collateralFactor: number;
  timestamp: number;
}

export interface StakingPosition {
  protocol: string;
  token: string;
  stakedAmount: string;
  rewardsEarned: string;
  apy: number;
  lockPeriodDays: number;
  validator?: string;
  activeSince: number;
}

export interface YieldVault {
  name: string;
  protocol: string;
  depositToken: string;
  tvl: number;
  apy: number;
  apyBase: number;
  apyReward: number;
  vaultAddress: string;
  strategyAddress: string;
}

export interface AirdropClaim {
  recipient: string;
  token: string;
  amount: string;
  amountFormatted: string;
  proof: string[];
  index: number;
  claimed: boolean;
}

/**
 * sham.defi - Generate fake DeFi protocol data
 */
export class DefiModule extends BaseModule {

  /** Generate a lending position */
  lendingPosition(): LendingPosition {
    const type = this.rng.pick(['supply', 'borrow'] as const);
    const assets = ['ETH', 'WETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'LINK', 'UNI', 'AAVE', 'CRV'];
    const asset = this.rng.pick(assets);
    const amount = this.rng.powerLaw(10, 1_000_000, 1.3);

    return {
      protocol: this.rng.pick(PROTOCOL_NAMES),
      asset,
      type,
      amount: amount.toFixed(6),
      amountUsd: parseFloat((amount * this.rng.float(0.5, 5000)).toFixed(2)),
      apy: parseFloat(this.rng.float(0.5, type === 'supply' ? 15 : 25).toFixed(2)),
      healthFactor: type === 'borrow' ? parseFloat(this.rng.float(1.05, 5.0).toFixed(2)) : undefined,
      collateralFactor: parseFloat(this.rng.pick([0.5, 0.6, 0.65, 0.7, 0.75, 0.8, 0.825]).toFixed(3)),
      timestamp: Math.floor(this.timestamp(90).getTime() / 1000),
    };
  }

  /** Generate a staking position */
  stakingPosition(): StakingPosition {
    const tokens = ['ETH', 'SOL', 'MATIC', 'AVAX', 'ATOM', 'DOT', 'ADA'];
    const token = this.rng.pick(tokens);
    const staked = this.rng.powerLaw(0.1, 100_000, 1.3);
    const apy = this.rng.float(3, 20);
    const daysSince = this.rng.int(1, 365);
    const rewards = staked * (apy / 100) * (daysSince / 365);

    return {
      protocol: this.rng.pick(['Lido', 'Rocket Pool', 'Eigenlayer', 'Jito', 'Marinade', 'Frax']),
      token,
      stakedAmount: staked.toFixed(6),
      rewardsEarned: rewards.toFixed(6),
      apy: parseFloat(apy.toFixed(2)),
      lockPeriodDays: this.rng.pick([0, 7, 14, 30, 90, 180, 365]),
      validator: this.rng.chance(0.6) ? '0x' + this.rng.hex(20) : undefined,
      activeSince: Math.floor(Date.now() / 1000) - daysSince * 86400,
    };
  }

  /** Generate yield vault info */
  vault(): YieldVault {
    const tokens = ['ETH', 'USDC', 'DAI', 'WBTC', 'stETH', 'FRAX', 'CRV', 'CVX'];
    const depositToken = this.rng.pick(tokens);
    const apyBase = this.rng.float(1, 15);
    const apyReward = this.rng.float(0, 25);

    return {
      name: `${depositToken} Yield Vault`,
      protocol: this.rng.pick(PROTOCOL_NAMES),
      depositToken,
      tvl: parseFloat(this.rng.powerLaw(100_000, 500_000_000, 1.2).toFixed(0)),
      apy: parseFloat((apyBase + apyReward).toFixed(2)),
      apyBase: parseFloat(apyBase.toFixed(2)),
      apyReward: parseFloat(apyReward.toFixed(2)),
      vaultAddress: '0x' + this.rng.hex(20),
      strategyAddress: '0x' + this.rng.hex(20),
    };
  }

  /** Generate airdrop claims with fake Merkle proofs */
  airdrop(count: number = 100, tokenSymbol: string = 'TOKEN'): AirdropClaim[] {
    return Array.from({ length: count }, (_, i) => {
      const amount = this.rng.powerLaw(10, 1_000_000, 1.5);
      const decimals = 18;
      const rawAmount = BigInt(Math.floor(amount)) * BigInt(10 ** decimals);
      const proofDepth = this.rng.int(8, 16);

      return {
        recipient: '0x' + this.rng.hex(20),
        token: tokenSymbol,
        amount: rawAmount.toString(),
        amountFormatted: amount.toFixed(2),
        proof: Array.from({ length: proofDepth }, () => '0x' + this.rng.hex(32)),
        index: i,
        claimed: this.rng.chance(0.4),
      };
    });
  }

  /** Generate a token vesting schedule */
  vestingSchedule(opts?: { totalAmount?: number; months?: number }) {
    const total = opts?.totalAmount ?? this.rng.powerLaw(10_000, 10_000_000, 1.3);
    const months = opts?.months ?? this.rng.pick([12, 18, 24, 36, 48]);
    const cliffMonths = this.rng.pick([0, 3, 6, 12]);
    const startDate = Math.floor(this.timestamp(365).getTime() / 1000);

    const schedule = [];
    for (let m = 0; m <= months; m++) {
      const unlockTime = startDate + m * 30 * 86400;
      const unlocked = m < cliffMonths ? 0 : total * ((m - cliffMonths) / (months - cliffMonths));
      schedule.push({
        month: m,
        timestamp: unlockTime,
        unlocked: parseFloat(Math.min(unlocked, total).toFixed(2)),
        percentage: parseFloat((Math.min(unlocked / total, 1) * 100).toFixed(1)),
      });
    }

    return {
      beneficiary: '0x' + this.rng.hex(20),
      totalAmount: total.toFixed(2),
      cliffMonths,
      vestingMonths: months,
      startDate,
      schedule,
    };
  }
}
