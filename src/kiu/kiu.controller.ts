import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { KiuService } from './kiu.service';
import { KiuRequestDto } from './dto/kiu-request.dto';

@Controller('kiu')
export class KiuController {
  private readonly logger = new Logger(KiuController.name);

  constructor(private readonly kiuService: KiuService) {}

  @Post('proxy')
  @HttpCode(HttpStatus.OK)
  async proxy(@Body() body: KiuRequestDto): Promise<string> {
    this.logger.log('📥 Received KIU proxy request');
    this.logger.debug(`User: ${body.user}, Request length: ${body.request.length}`);

    try {
      const response = await this.kiuService.sendToKiu(
        body.request,
        body.user,
        body.password,
      );

      this.logger.log('✅ KIU proxy request completed successfully');
      return response;
    } catch (error) {
      this.logger.error('❌ KIU proxy request failed:', error);
      throw error;
    }
  }
}

