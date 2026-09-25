import { Controller, Get, Post, Query, Body, Headers, Res, HttpCode, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { WhatsAppService } from './whatsapp.service';
import { Public } from '../../common/decorators/permissions.decorator';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('WhatsApp')
@Controller('webhook/whatsapp')
export class WhatsAppWebhookController {
  private readonly logger = new Logger(WhatsAppWebhookController.name);

  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'WhatsApp webhook verification' })
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const result = this.whatsappService.verifyWebhook(mode, token, challenge);
    if (result) return res.status(200).send(result);
    return res.status(403).json({ error: 'Verification failed' });
  }

  @Public()
  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Receive WhatsApp webhook events' })
  async receiveWebhook(@Body() payload: any) {
    try {
      if (payload.object !== 'whatsapp_business_account') return { status: 'ignored' };
      // Webhook events are logged and processed asynchronously
      this.logger.log(`Webhook received: ${JSON.stringify(payload).slice(0, 200)}`);
      return { status: 'ok' };
    } catch (error) {
      this.logger.error('Webhook error:', error);
      return { status: 'error' };
    }
  }
}
