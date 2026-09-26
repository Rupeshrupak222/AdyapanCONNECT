import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const TenantId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  // SECURITY: for an authenticated request the tenant used for data scoping MUST
  // come from the verified JWT, never from the client-supplied X-Tenant-Slug
  // header. The header is only trusted when there is no authenticated user
  // (public tenant-resolution routes). This prevents a logged-in user from
  // reaching another tenant's data by spoofing the header.
  const tenantId = request.user?.tenantId || request.tenantId;
  if (!tenantId) {
    throw new UnauthorizedException('Tenant context required');
  }
  return tenantId;
});

export const CurrentTenant = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.tenant;
});
