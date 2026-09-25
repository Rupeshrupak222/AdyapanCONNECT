import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';

import { DatabaseModule } from './database/database.module';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { RolesModule } from './modules/roles/roles.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';
import { WabaModule } from './modules/waba/waba.module';
import { PhoneNumbersModule } from './modules/phone-numbers/phone-numbers.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { MessagesModule } from './modules/messages/messages.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { BroadcastsModule } from './modules/broadcasts/broadcasts.module';
import { SegmentationModule } from './modules/segmentation/segmentation.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { AiAgentModule } from './modules/ai-agent/ai-agent.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { CrmModule } from './modules/crm/crm.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { DeveloperApiModule } from './modules/developer-api/developer-api.module';
import { BillingModule } from './modules/billing/billing.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MediaModule } from './modules/media/media.module';
import { AuditModule } from './modules/audit/audit.module';
import { AdminModule } from './modules/admin/admin.module';
import { ContactModule } from './modules/contact/contact.module';
import { HealthModule } from './modules/health/health.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get('RATE_LIMIT_TTL', 60) * 1000,
            limit: config.get('RATE_LIMIT_MAX', 100),
          },
        ],
      }),
    }),

    // Scheduler
    ScheduleModule.forRoot(),

    // Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: new URL(config.get('REDIS_URL', 'redis://localhost:6379')).hostname,
          port: parseInt(new URL(config.get('REDIS_URL', 'redis://localhost:6379')).port || '6379'),
          password: config.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 500,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      }),
    }),

    // HTTP client
    HttpModule,

    // Core modules
    DatabaseModule,
    MailModule,
    HealthModule,

    // Feature modules
    AuthModule,
    UsersModule,
    TenantsModule,
    RolesModule,
    WhatsAppModule,
    WabaModule,
    PhoneNumbersModule,
    ContactsModule,
    ConversationsModule,
    MessagesModule,
    TemplatesModule,
    CampaignsModule,
    BroadcastsModule,
    SegmentationModule,
    ChatbotModule,
    AiAgentModule,
    WorkflowsModule,
    CrmModule,
    AnalyticsModule,
    WebhooksModule,
    DeveloperApiModule,
    BillingModule,
    NotificationsModule,
    MediaModule,
    AuditModule,
    AdminModule,
    ContactModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
