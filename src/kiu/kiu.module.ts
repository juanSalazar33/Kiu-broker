import { Module } from '@nestjs/common';
import { KiuController } from './kiu.controller';
import { KiuService } from './kiu.service';

@Module({
  controllers: [KiuController],
  providers: [KiuService],
  exports: [KiuService],
})
export class KiuModule {}

