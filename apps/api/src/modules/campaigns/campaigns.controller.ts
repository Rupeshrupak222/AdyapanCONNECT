import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUserId } from '../../common/decorators/user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CampaignsService } from './campaigns.service';

@ApiTags('Campaigns')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  @RequirePermissions('campaign.view')
  @ApiOperation({ summary: 'List all campaigns' })
  findAll(
    @TenantId() tenantId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.campaignsService.findAll(tenantId, { page, pageSize, status, search });
  }

  @Get(':id')
  @RequirePermissions('campaign.view')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.campaignsService.findOne(tenantId, id);
  }

  @Get(':id/stats')
  @RequirePermissions('campaign.view')
  getStats(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.campaignsService.getStats(tenantId, id);
  }

  @Post()
  @RequirePermissions('campaign.create')
  @ApiOperation({ summary: 'Create a new campaign' })
  create(@TenantId() tenantId: string, @CurrentUserId() userId: string, @Body() dto: any) {
    return this.campaignsService.create(tenantId, userId, dto);
  }

  @Put(':id')
  @RequirePermissions('campaign.edit')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return this.campaignsService.update(tenantId, id, dto);
  }

  @Post(':id/launch')
  @RequirePermissions('campaign.launch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Launch a campaign' })
  launch(@TenantId() tenantId: string, @Param('id') id: string, @CurrentUserId() userId: string) {
    return this.campaignsService.launch(tenantId, id, userId);
  }

  @Post(':id/pause')
  @RequirePermissions('campaign.edit')
  @HttpCode(HttpStatus.OK)
  pause(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.campaignsService.pause(tenantId, id);
  }

  @Delete(':id')
  @RequirePermissions('campaign.delete')
  cancel(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.campaignsService.cancel(tenantId, id);
  }
}
