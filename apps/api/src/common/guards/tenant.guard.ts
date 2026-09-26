import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = request.tenantId;

    if (!user) return false;

    // Super admins can access any tenant
    if (user.role === 'SUPER_ADMIN' || user.role === 'PLATFORM_ADMIN') return true;

    // The authoritative tenant is the one embedded in the verified JWT.
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    // If the client also sent an X-Tenant-Slug header, it MUST match the JWT
    // tenant. A mismatch is a cross-tenant access attempt and is rejected
    // rather than silently ignored.
    if (tenantId && user.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied to this tenant');
    }

    return true;
  }
}
