import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { SuperAdminOnly } from '../../common/decorators/permissions.decorator';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@SuperAdminOnly()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() { return this.adminService.getPlatformStats(); }

  @Get('overview')
  getOverview() { return this.adminService.getOverview(); }

  @Get('users')
  getUsers(@Query() q: any) { return this.adminService.getUsers(q); }

  @Get('users/:id')
  getUser(@Param('id') id: string) { return this.adminService.getUserById(id); }

  @Post('users/:id/suspend')
  suspendUser(@Param('id') id: string) { return this.adminService.setUserStatus(id, 'SUSPENDED'); }

  @Post('users/:id/activate')
  activateUser(@Param('id') id: string) { return this.adminService.setUserStatus(id, 'ACTIVE'); }

  @Get('tenants')
  getTenants(@Query() q: any) { return this.adminService.getTenants(q); }

  @Get('tenants/:id')
  getTenant(@Param('id') id: string) { return this.adminService.getTenantById(id); }

  @Post('tenants/:id/suspend')
  suspend(@Param('id') id: string) { return this.adminService.suspendTenant(id); }

  @Post('tenants/:id/activate')
  activate(@Param('id') id: string) { return this.adminService.activateTenant(id); }

  @Get('messages/volume')
  getVolume(@Query('days') days = 30) { return this.adminService.getMessageVolume(Number(days)); }

  @Get('revenue')
  getRevenue() { return this.adminService.getRevenue(); }
}
