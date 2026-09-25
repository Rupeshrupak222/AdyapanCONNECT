import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../database/prisma.service';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenantSlug?: string;
      tenant?: any;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Extract tenant from header or subdomain
    const tenantSlug =
      req.headers['x-tenant-slug'] as string ||
      this.extractSubdomain(req.hostname);

    if (tenantSlug && tenantSlug !== 'api' && tenantSlug !== 'localhost') {
      try {
        const tenant = await this.prisma.tenant.findUnique({
          where: { slug: tenantSlug },
          select: { id: true, slug: true, status: true },
        });

        if (tenant) {
          if (tenant.status === 'SUSPENDED') {
            throw new UnauthorizedException('Account suspended. Contact support.');
          }
          req.tenantId = tenant.id;
          req.tenantSlug = tenant.slug;
          req.tenant = tenant;
        }
      } catch (error) {
        if (error instanceof UnauthorizedException) throw error;
        // Ignore tenant lookup errors for public routes
      }
    }

    next();
  }

  private extractSubdomain(hostname: string): string | null {
    const parts = hostname.split('.');
    if (parts.length > 2) {
      return parts[0];
    }
    return null;
  }
}
