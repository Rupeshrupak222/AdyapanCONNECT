import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @RequirePermissions('analytics.view')
  getDashboard(
    @TenantId() tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getDashboardStats(
      tenantId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get('messages/trend')
  @RequirePermissions('analytics.view')
  getMessageTrend(@TenantId() tenantId: string, @Query('days') days = 30) {
    return this.analyticsService.getMessageTrend(tenantId, Number(days));
  }

  @Get('campaigns')
  @RequirePermissions('analytics.view')
  getCampaigns(@TenantId() tenantId: string, @Query('page') page = 1, @Query('pageSize') pageSize = 10) {
    return this.analyticsService.getCampaignAnalytics(tenantId, Number(page), Number(pageSize));
  }
}
