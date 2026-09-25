import { Module } from '@nestjs/common';
import { DeveloperApiController } from './developer-api.controller';
import { DeveloperApiService } from './developer-api.service';

@Module({ controllers: [DeveloperApiController], providers: [DeveloperApiService], exports: [DeveloperApiService] })
export class DeveloperApiModule {}
