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

    // User must belong to the current tenant
    if (!tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    if (user.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied to this tenant');
    }

    return true;
  }
}
