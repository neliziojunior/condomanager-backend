import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PollService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, createdById: string, data: {
    title: string;
    description?: string;
    options: string[];
    expiresAt?: string;
    allowMultiple?: boolean;
    isAnonymous?: boolean;
  }) {
    return this.prisma.poll.create({
      data: {
        condominiumId,
        createdById,
        title: data.title,
        description: data.description,
        options: data.options,
        allowMultiple: data.allowMultiple || false,
        isAnonymous: data.isAnonymous || false,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  }

  async findAll(condominiumId: string) {
    const polls = await this.prisma.poll.findMany({
      where: { condominiumId },
      include: {
        votes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return polls.map(poll => {
      const totalVotes = poll.votes.length;
      const results = poll.options.map((opt, i) => {
        const votesForOption = poll.votes.filter(v => v.options.includes(i)).length;
        return {
          option: opt,
          votes: votesForOption,
          percentage: totalVotes > 0 ? (votesForOption / totalVotes) * 100 : 0,
        };
      });

      return {
        ...poll,
        totalVotes,
        results,
      };
    });
  }

  async vote(pollId: string, personId: string, options: number[]) {
    return this.prisma.vote.upsert({
      where: { pollId_personId: { pollId, personId } },
      update: { options },
      create: { pollId, personId, options },
    });
  }

  async getResults(pollId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: { votes: true },
    });
    if (!poll) return null;

    const totalVotes = poll.votes.length;
    const results = poll.options.map((opt, i) => {
      const votesForOption = poll.votes.filter(v => v.options.includes(i)).length;
      return {
        option: opt,
        votes: votesForOption,
        percentage: totalVotes > 0 ? (votesForOption / totalVotes) * 100 : 0,
      };
    });

    return {
      title: poll.title,
      total: totalVotes,
      results,
    };
  }

  async close(id: string) {
    return this.prisma.poll.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async delete(id: string) {
    return this.prisma.poll.delete({ where: { id } });
  }
}
