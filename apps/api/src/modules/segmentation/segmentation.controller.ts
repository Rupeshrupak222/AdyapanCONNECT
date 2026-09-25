import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUserId } from '../../common/decorators/user.decorator';
import { SegmentationService } from './segmentation.service';

@ApiTags('Segmentation')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('segments')
export class SegmentationController {
  constructor(private readonly segmentationService: SegmentationService) {}

  @Get()
  findAll(@TenantId() tenantId: string) { return this.segmentationService.findAll(tenantId); }

  @Post()
  create(@TenantId() tenantId: string, @CurrentUserId() userId: string, @Body() dto: any) {
    return this.segmentationService.create(tenantId, userId, dto);
  }

  @Delete(':id')
  delete(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.segmentationService.delete(tenantId, id);
  }
}
