import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignWorker } from './campaign.worker';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({ name: 'campaigns' }),
    BullModule.registerQueue({ name: 'messages' }),
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService, CampaignWorker, WhatsAppService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
