import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';

@Module({ imports: [BullModule.registerQueue({ name: 'workflows' })], controllers: [WorkflowsController], providers: [WorkflowsService], exports: [WorkflowsService] })
export class WorkflowsModule {}
