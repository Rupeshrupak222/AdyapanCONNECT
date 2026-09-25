import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/permissions.decorator';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  check() {
    return { status: 'ok', service: 'adyapan-connect-api', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get('db')
  async checkDb() {
    const ok = await this.prisma.healthCheck();
    return { status: ok ? 'ok' : 'error', database: ok ? 'connected' : 'disconnected' };
  }

  @Public()
  @Get('ready')
  readiness() {
    return { status: 'ready', version: process.env.npm_package_version || '1.0.0' };
  }
}
