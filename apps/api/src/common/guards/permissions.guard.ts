import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, IS_SUPER_ADMIN_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiresSuperAdmin = this.reflector.getAllAndOverride<boolean>(IS_SUPER_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user } = context.switchToHttp().getRequest();

    if (!user) return false;

    // Super admin has all permissions
    if (user.role === 'SUPER_ADMIN') return true;

    if (requiresSuperAdmin) {
      throw new ForbiddenException('Super admin access required');
    }

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const userPermissions: string[] = user.permissions || [];

    // Check wildcard permissions
    if (userPermissions.includes('*')) return true;

    const hasPermission = requiredPermissions.every((permission) => {
      if (userPermissions.includes(permission)) return true;

      // Check module wildcard (e.g. "campaign.*" covers "campaign.create")
      const [module] = permission.split('.');
      if (userPermissions.includes(`${module}.*`)) return true;

      return false;
    });

    if (!hasPermission) {
      throw new ForbiddenException(`Missing required permissions: ${requiredPermissions.join(', ')}`);
    }

    return true;
  }
}
