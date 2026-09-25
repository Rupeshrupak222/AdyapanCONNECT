import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { WabaService } from './waba.service';

@ApiTags('WABA')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('waba')
export class WabaController {
  constructor(private readonly wabaService: WabaService) {}

  @Get()
  findAll(@TenantId() tenantId: string) { return this.wabaService.findAll(tenantId); }
}
