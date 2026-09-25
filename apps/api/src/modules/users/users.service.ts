import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        displayName: true, avatarUrl: true, phoneNumber: true,
        status: true, emailVerified: true, twoFactorEnabled: true,
        lastLoginAt: true, createdAt: true,
        tenantMemberships: {
          include: { tenant: { select: { id: true, name: true, slug: true } }, role: { select: { name: true } } },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: string, dto: { firstName?: string; lastName?: string; displayName?: string; phoneNumber?: string }) {
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user?.passwordHash) throw new NotFoundException('User not found');
    const valid = await argon2.verify(user.passwordHash, currentPassword);
    if (!valid) throw new Error('Current password is incorrect');
    const hash = await argon2.hash(newPassword, { type: argon2.argon2id });
    return this.prisma.user.update({ where: { id }, data: { passwordHash: hash } });
  }

  async getSessions(userId: string) {
    return this.prisma.userSession.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true, ipAddress: true, userAgent: true, createdAt: true, expiresAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
