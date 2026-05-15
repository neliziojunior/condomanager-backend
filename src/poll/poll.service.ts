import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PollService {
  constructor(private prisma: PrismaService) {}

  async create(condominiumId: string, data: { title: string; description?: string; options: string[]; expiresAt?: string }) {
    return this.prisma.poll.create({
      data: { ...data, condominiumId, expiresAt: data.expiresAt ? new Date(data.expiresAt) : null },
    });
  }

  async findAll(condominiumId: string) {
    return this.prisma.poll.findMany({
      where: { condominiumId },
      include: { votes: { select: { option: true, personId: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async vote(pollId: string, personId: string, option: number) {
    return this.prisma.vote.upsert({
      where: { pollId_personId: { pollId, personId } },
      update: { option },
      create: { pollId, personId, option },
    });
  }

  async getResults(pollId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: { votes: true },
    });
    
    const results = poll.options.map((opt, i) => ({
      option: opt,
      votes: poll.votes.filter(v => v.option === i).length,
      percentage: poll.votes.length > 0 ? (poll.votes.filter(v => v.option === i).length / poll.votes.length) * 100 : 0,
    }));

    return { title: poll.title, total: poll.votes.length, results };
  }
}
