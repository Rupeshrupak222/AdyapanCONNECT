import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PhoneNumbersService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(tenantId: string) {
    return this.prisma.whatsAppPhoneNumber.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }
}
