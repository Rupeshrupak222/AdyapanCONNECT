import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    if (payload.type === '2fa_pending') {
      throw new UnauthorizedException('2FA verification required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        avatarUrl: true, status: true, emailVerified: true, twoFactorEnabled: true,
      },
    });

    if (!user || user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account not active');
    }

    return {
      ...payload,
      ...user,
      sub: payload.sub,
    };
  }
}
