import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development'
        ? [{ emit: 'event', level: 'query' }, 'error', 'warn']
        : ['error'],
      errorFormat: 'colorless',
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }

    // Soft-delete middleware
    this.$use(async (params, next) => {
      const modelsWithSoftDelete = ['User', 'Tenant', 'Contact', 'Campaign', 'WhatsAppTemplate', 'Chatbot', 'AIAgent', 'Workflow'];

      if (modelsWithSoftDelete.includes(params.model || '')) {
        if (params.action === 'delete') {
          params.action = 'update';
          params.args['data'] = { deletedAt: new Date() };
        }
        if (params.action === 'deleteMany') {
          params.action = 'updateMany';
          if (params.args.data !== undefined) {
            params.args.data['deletedAt'] = new Date();
          } else {
            params.args['data'] = { deletedAt: new Date() };
          }
        }
        if (['findFirst', 'findMany', 'findUnique', 'count'].includes(params.action)) {
          if (!params.args) params.args = {};
          if (!params.args.where) params.args.where = {};
          params.args.where['deletedAt'] = null;
        }
      }
      return next(params);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
