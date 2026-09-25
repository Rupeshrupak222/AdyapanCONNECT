import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { PhoneNumbersService } from './phone-numbers.service';

@ApiTags('Phone Numbers')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('phone-numbers')
export class PhoneNumbersController {
  constructor(private readonly service: PhoneNumbersService) {}
  @Get()
  findAll(@TenantId() tenantId: string) { return this.service.findAll(tenantId); }
}
