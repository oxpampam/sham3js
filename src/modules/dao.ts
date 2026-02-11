import { BaseModule } from '../core/base-module.js';
import { DAO_PROPOSAL_TITLES, PROTOCOL_NAMES } from '../data/pools.js';

export interface DAOProposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  status: 'pending' | 'active' | 'succeeded' | 'defeated' | 'queued' | 'executed' | 'cancelled' | 'expired';
  forVotes: string;
  againstVotes: string;
  abstainVotes: string;
  quorum: string;
  startBlock: number;
  endBlock: number;
  eta?: number;
  createdAt: number;
}

export interface DAOVote {
  voter: string;
  proposalId: number;
  support: 0 | 1 | 2; // against, for, abstain
  weight: string;
  reason: string;
  timestamp: number;
  txHash: string;
}

export interface DAODelegate {
  address: string;
  delegatedVotes: string;
  delegators: number;
  proposalsVoted: number;
  proposalsCreated: number;
  votingParticipation: number;
}

export interface DAOConfig {
  name: string;
  token: string;
  proposalThreshold: string;
  quorumNumerator: number;
  votingDelay: number;
  votingPeriod: number;
  timelockDelay: number;
  governorAddress: string;
  timelockAddress: string;
  tokenAddress: string;
}

/**
 * sham.dao - Generate fake DAO governance data
 *
 * @example
 * sham.dao.proposal()                    // A DAO proposal
 * sham.dao.vote()                        // A governance vote
 * sham.dao.election(5, 1000)             // 5 proposals with 1000 voters
 * sham.dao.delegate()                    // Delegate profile
 */
export class DAOModule extends BaseModule {

  /** Generate a DAO proposal */
  proposal(overrides?: Partial<DAOProposal>): DAOProposal {
    let title = this.rng.pick(DAO_PROPOSAL_TITLES);
    title = title
      .replace('{protocol}', this.rng.pick(PROTOCOL_NAMES))
      .replace('{chain}', this.rng.pick(['Arbitrum', 'Optimism', 'Base', 'Polygon', 'Solana']))
      .replace('{quarter}', this.rng.pick(['1', '2', '3', '4']));

    const status = this.rng.pick([
      'pending', 'active', 'succeeded', 'defeated', 'queued', 'executed', 'cancelled',
    ] as const);

    const forVotes = BigInt(Math.floor(this.rng.powerLaw(1000, 50_000_000, 1.3))) * BigInt(1e18);
    const againstVotes = BigInt(Math.floor(this.rng.powerLaw(100, 10_000_000, 1.5))) * BigInt(1e18);
    const abstainVotes = BigInt(Math.floor(this.rng.powerLaw(10, 1_000_000, 1.8))) * BigInt(1e18);
    const quorum = BigInt(Math.floor(this.rng.float(1_000_000, 10_000_000))) * BigInt(1e18);

    const startBlock = this.rng.int(15_000_000, 20_000_000);
    const votingPeriod = this.rng.pick([50400, 40320, 17280]); // ~1 week, ~5.6 days, ~2.4 days

    return {
      id: this.rng.int(1, 500),
      title,
      description: `## Summary\n\n${title}\n\n## Motivation\n\nThis proposal aims to improve the protocol by addressing community feedback and optimizing operations.\n\n## Specification\n\nThe implementation details will be handled by the core team with community oversight.`,
      proposer: '0x' + this.rng.hex(20),
      status,
      forVotes: forVotes.toString(),
      againstVotes: againstVotes.toString(),
      abstainVotes: abstainVotes.toString(),
      quorum: quorum.toString(),
      startBlock,
      endBlock: startBlock + votingPeriod,
      eta: status === 'queued' ? Math.floor(Date.now() / 1000) + 172800 : undefined,
      createdAt: Math.floor(this.timestamp(180).getTime() / 1000),
      ...overrides,
    };
  }

  /** Generate a governance vote */
  vote(overrides?: Partial<DAOVote>): DAOVote {
    const reasons = [
      'Strongly support this initiative.',
      'This aligns with the protocol\'s long-term vision.',
      'Voting against — the proposed changes are too aggressive.',
      'Abstaining pending further analysis from the risk committee.',
      'Great proposal. The community has been asking for this.',
      '',
      '',
      'Concerned about the budget allocation but overall supportive.',
      'We need more time to evaluate the security implications.',
    ];

    return {
      voter: '0x' + this.rng.hex(20),
      proposalId: this.rng.int(1, 500),
      support: this.rng.weighted([1, 0, 2], [60, 25, 15]) as 0 | 1 | 2,
      weight: (BigInt(Math.floor(this.rng.powerLaw(100, 10_000_000, 1.5))) * BigInt(1e18)).toString(),
      reason: this.rng.pick(reasons),
      timestamp: Math.floor(this.timestamp(30).getTime() / 1000),
      txHash: '0x' + this.rng.hex(32),
      ...overrides,
    };
  }

  /** Generate a delegate profile */
  delegate(): DAODelegate {
    const votingPower = this.rng.powerLaw(1000, 50_000_000, 1.3);

    return {
      address: '0x' + this.rng.hex(20),
      delegatedVotes: (BigInt(Math.floor(votingPower)) * BigInt(1e18)).toString(),
      delegators: this.rng.int(1, 5000),
      proposalsVoted: this.rng.int(0, 200),
      proposalsCreated: this.rng.int(0, 20),
      votingParticipation: parseFloat(this.rng.float(0.1, 1.0).toFixed(2)),
    };
  }

  /** Generate DAO configuration */
  config(): DAOConfig {
    const protocolName = this.rng.pick(PROTOCOL_NAMES);

    return {
      name: `${protocolName} DAO`,
      token: protocolName.toUpperCase().replace(/\s/g, '').slice(0, 5),
      proposalThreshold: (BigInt(this.rng.pick([10000, 50000, 100000, 500000])) * BigInt(1e18)).toString(),
      quorumNumerator: this.rng.pick([4, 5, 10, 15, 20]),
      votingDelay: this.rng.pick([1, 7200, 14400]),
      votingPeriod: this.rng.pick([17280, 40320, 50400]),
      timelockDelay: this.rng.pick([86400, 172800, 259200]),
      governorAddress: '0x' + this.rng.hex(20),
      timelockAddress: '0x' + this.rng.hex(20),
      tokenAddress: '0x' + this.rng.hex(20),
    };
  }

  /**
   * Generate a full election: a proposal + N votes with realistic distribution.
   * Whale votes have outsized weight (power-law).
   */
  election(
    proposalCount: number = 1,
    voterCount: number = 100
  ): { proposals: DAOProposal[]; votes: DAOVote[] } {
    const proposals: DAOProposal[] = [];
    const votes: DAOVote[] = [];

    for (let p = 0; p < proposalCount; p++) {
      const proposal = this.proposal({ id: p + 1 });
      proposals.push(proposal);

      const voters = Array.from({ length: voterCount }, () => '0x' + this.rng.hex(20));
      for (const voter of voters) {
        votes.push(
          this.vote({
            voter,
            proposalId: proposal.id,
          })
        );
      }
    }

    return { proposals, votes };
  }
}
