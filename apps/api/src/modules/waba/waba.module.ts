import { Module } from '@nestjs/common';
import { WabaController } from './waba.controller';
import { WabaService } from './waba.service';

@Module({ controllers: [WabaController], providers: [WabaService], exports: [WabaService] })
export class WabaModule {}
