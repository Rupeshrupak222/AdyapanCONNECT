import {
  Injectable, UnauthorizedException, ConflictException,
  BadRequestException, NotFoundException, Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as speakeasy from 'speakeasy';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        tenantMemberships: {
          where: { isActive: true },
          include: { role: { include: { permissions: { include: { permission: true } } } } },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account locked. Try again later.');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account suspended. Contact support.');
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: { increment: 1 },
          ...(user.loginAttempts >= 4 && {
            lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
          }),
        },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset login attempts
    await this.prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    return user;
  }

  async login(user: any, ip?: string, userAgent?: string) {
    const membership = user.tenantMemberships?.[0];
    const permissions = membership?.role?.permissions?.map((rp: any) => rp.permission.name) || [];

    if (user.twoFactorEnabled) {
      const tempToken = this.jwtService.sign(
        { sub: user.id, type: '2fa_pending' },
        { expiresIn: '5m' },
      );
      return { requiresTwoFactor: true, tempToken };
    }

    return this.generateTokens(user, membership?.tenantId, membership?.role?.name, permissions, ip, userAgent);
  }

  async verifyTwoFactor(tempToken: string, code: string, ip?: string, userAgent?: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(tempToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }

    if (payload.type !== '2fa_pending') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        tenantMemberships: {
          where: { isActive: true },
          include: { role: { include: { permissions: { include: { permission: true } } } } },
        },
      },
    });

    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('Invalid session');
    }

    const valid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!valid) {
      // Check backup codes
      const backupIdx = user.backupCodes.findIndex(c => c === code);
      if (backupIdx === -1) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
      // Remove used backup code
      const updatedCodes = [...user.backupCodes];
      updatedCodes.splice(backupIdx, 1);
      await this.prisma.user.update({ where: { id: user.id }, data: { backupCodes: updatedCodes } });
    }

    const membership = user.tenantMemberships?.[0];
    const permissions = membership?.role?.permissions?.map((rp: any) => rp.permission.name) || [];
    return this.generateTokens(user, membership?.tenantId, membership?.role?.name, permissions, ip, userAgent);
  }

  async register(dto: {
    email: string; password: string; firstName: string; lastName: string;
    businessName?: string; phoneNumber?: string; source?: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phoneNumber: dto.phoneNumber,
          source: dto.source,
          status: 'PENDING',
        },
      });

      if (dto.businessName) {
        const slug = this.generateSlug(dto.businessName);

        // Create the tenant first, then the role scoped to that tenant in one step.
        // This avoids a transient Role row with tenantId=null that would collide on
        // the @@unique([tenantId, name]) constraint across concurrent registrations.
        const tenant = await tx.tenant.create({
          data: {
            name: dto.businessName,
            slug: await this.ensureUniqueSlug(slug, tx),
            status: 'TRIAL',
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        });

        const role = await tx.role.create({
          data: {
            name: 'TENANT_OWNER',
            isDefault: true,
            isSystem: true,
            tenantId: tenant.id,
          },
        });

        await tx.tenantMember.create({
          data: {
            tenantId: tenant.id,
            userId: newUser.id,
            roleId: role.id,
            isActive: true,
            joinedAt: new Date(),
          },
        });

        // Create default wallet
        await tx.creditWallet.create({
          data: { tenantId: tenant.id, balance: 0, currency: 'INR' },
        });
      }

      // Send verification email (queued)
      return newUser;
    });

    // Generate email OTP and send verification email
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.prisma.otpVerification.create({
      data: {
        userId: user.id,
        email: user.email,
        otp: await argon2.hash(otp),
        type: 'EMAIL_VERIFY',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const { link, devMode } = await this.mail.sendVerificationEmail(user.email, otp, user.id);

    return {
      userId: user.id,
      message: 'Registration successful. Please verify your email.',
      // In dev (no SMTP), surface the OTP + link so the flow is testable end-to-end.
      ...(devMode ? { devOtp: otp, devVerifyLink: link } : {}),
    };
  }

  async verifyEmail(email: string, otp: string) {
    const record = await this.prisma.otpVerification.findFirst({
      where: { email: email.toLowerCase(), type: 'EMAIL_VERIFY', usedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    const valid = await argon2.verify(record.otp, otp);
    if (!valid) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.$transaction([
      this.prisma.otpVerification.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      this.prisma.user.updateMany({
        where: { email: email.toLowerCase() },
        data: { emailVerified: true, emailVerifiedAt: new Date(), status: 'ACTIVE' },
      }),
    ]);

    return { message: 'Email verified successfully. You can now log in.' };
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Don't reveal whether the account exists / is already verified
    if (!user || user.emailVerified) {
      return { message: 'If your account needs verification, a new email has been sent.' };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.prisma.otpVerification.create({
      data: {
        userId: user.id,
        email: user.email,
        otp: await argon2.hash(otp),
        type: 'EMAIL_VERIFY',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const { link, devMode } = await this.mail.sendVerificationEmail(user.email, otp, user.id);
    return {
      message: 'Verification email sent.',
      ...(devMode ? { devOtp: otp, devVerifyLink: link } : {}),
    };
  }

  async handleOAuthLogin(
    profile: { googleId?: string; githubId?: string; email: string; firstName?: string; lastName?: string; avatarUrl?: string },
    ip?: string,
    userAgent?: string,
  ) {
    if (!profile?.email) {
      throw new BadRequestException('OAuth provider did not return an email');
    }
    const email = profile.email.toLowerCase();

    // Find by provider id first, then by email
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          profile.googleId ? { googleId: profile.googleId } : undefined,
          profile.githubId ? { githubId: profile.githubId } : undefined,
          { email },
        ].filter(Boolean) as any,
      },
      include: {
        tenantMemberships: {
          where: { isActive: true },
          include: { role: { include: { permissions: { include: { permission: true } } } } },
        },
      },
    });

    if (!user) {
      // Create a new verified user via OAuth
      const created = await this.prisma.user.create({
        data: {
          email,
          firstName: profile.firstName || 'User',
          lastName: profile.lastName || '',
          avatarUrl: profile.avatarUrl,
          googleId: profile.googleId,
          githubId: profile.githubId,
          emailVerified: true,
          emailVerifiedAt: new Date(),
          status: 'ACTIVE',
        },
      });
      user = await this.prisma.user.findUnique({
        where: { id: created.id },
        include: {
          tenantMemberships: {
            where: { isActive: true },
            include: { role: { include: { permissions: { include: { permission: true } } } } },
          },
        },
      });
    } else {
      // Link provider id if missing and mark verified
      const data: any = {};
      if (profile.googleId && !user.googleId) data.googleId = profile.googleId;
      if (profile.githubId && !user.githubId) data.githubId = profile.githubId;
      if (!user.emailVerified) { data.emailVerified = true; data.emailVerifiedAt = new Date(); data.status = 'ACTIVE'; }
      if (profile.avatarUrl && !user.avatarUrl) data.avatarUrl = profile.avatarUrl;
      if (Object.keys(data).length) {
        await this.prisma.user.update({ where: { id: user.id }, data });
      }
    }

    const membership = user!.tenantMemberships?.[0];
    const permissions = membership?.role?.permissions?.map((rp: any) => rp.permission.name) || [];
    return this.generateTokens(user, membership?.tenantId, membership?.role?.name, permissions, ip, userAgent);
  }

  async refreshTokens(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.prisma.userSession.findUnique({
      where: { refreshToken },
      include: {
        user: {
          include: {
            tenantMemberships: {
              where: { isActive: true },
              include: { role: { include: { permissions: { include: { permission: true } } } } },
            },
          },
        },
      },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    // Rotate refresh token
    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const user = session.user;
    const membership = user.tenantMemberships?.[0];
    const permissions = membership?.role?.permissions?.map((rp: any) => rp.permission.name) || [];

    return this.generateTokens(user, membership?.tenantId, membership?.role?.name, permissions);
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.userSession.updateMany({
        where: { userId, refreshToken },
        data: { revokedAt: new Date() },
      });
    }
  }

  async logoutAll(userId: string) {
    await this.prisma.userSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return; // Don't reveal if email exists

    const token = uuidv4();
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    const { link, devMode } = await this.mail.sendPasswordResetEmail(user.email, token);
    this.logger.log(`Password reset email sent for user ${user.id}`);
    // In dev (no SMTP) return the link so the flow is testable; controller decides whether to expose it.
    return devMode ? { devResetLink: link } : {};
  }

  async resetPassword(token: string, newPassword: string) {
    const reset = await this.prisma.passwordReset.findUnique({ where: { token } });
    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
      this.prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
      this.prisma.userSession.updateMany({ where: { userId: reset.userId }, data: { revokedAt: new Date() } }),
    ]);
  }

  async setupTwoFactor(userId: string) {
    const secret = speakeasy.generateSecret({ name: 'Adyapan Connect', length: 32 });
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 },
    });
    return { secret: secret.base32, otpAuthUrl: secret.otpauth_url };
  }

  async enableTwoFactor(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorSecret) throw new BadRequestException('2FA not set up');

    const valid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
    });

    if (!valid) throw new BadRequestException('Invalid code');

    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomUUID().replace(/-/g, '').substring(0, 10),
    );

    const hashedCodes = await Promise.all(backupCodes.map(c => argon2.hash(c)));
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true, backupCodes: hashedCodes },
    });

    return { backupCodes };
  }

  private async generateTokens(
    user: any,
    tenantId?: string,
    role?: string,
    permissions?: string[],
    ip?: string,
    userAgent?: string,
  ) {
    // Resolve tenant slug/name so the frontend can send the X-Tenant-Slug header
    let tenantSlug: string | undefined;
    let tenantName: string | undefined;
    if (tenantId) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { slug: true, name: true },
      });
      tenantSlug = tenant?.slug;
      tenantName = tenant?.name;
    }

    // Tenant owners and super admins implicitly have all permissions.
    let effectivePermissions = permissions || [];
    if ((role === 'TENANT_OWNER' || role === 'SUPER_ADMIN') && !effectivePermissions.includes('*')) {
      effectivePermissions = ['*'];
    }

    const sessionId = uuidv4();
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId,
      tenantSlug,
      role: role || 'VIEWER',
      permissions: effectivePermissions,
      sessionId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: user.id, sessionId, type: 'refresh' },
      {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      },
    );

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        ipAddress: ip,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        role,
        tenantId,
        tenantSlug,
        tenantName,
        twoFactorEnabled: user.twoFactorEnabled,
        emailVerified: user.emailVerified,
      },
    };
  }

  private generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  private async ensureUniqueSlug(slug: string, tx: any): Promise<string> {
    let finalSlug = slug;
    let counter = 0;
    while (await tx.tenant.findUnique({ where: { slug: finalSlug } })) {
      counter++;
      finalSlug = `${slug}-${counter}`;
    }
    return finalSlug;
  }
}
