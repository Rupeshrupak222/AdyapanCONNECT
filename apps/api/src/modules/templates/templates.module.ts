import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Module({
  imports: [HttpModule],
  controllers: [TemplatesController],
  providers: [TemplatesService, WhatsAppService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
