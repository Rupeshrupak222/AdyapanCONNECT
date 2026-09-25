import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WabaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.whatsAppBusinessAccount.findMany({
      where: { tenantId, isActive: true },
      include: { phoneNumbers: { select: { id: true, displayPhoneNumber: true, status: true, qualityRating: true } } },
    });
  }
}
