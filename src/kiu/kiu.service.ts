import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

@Injectable()
export class KiuService {
  private readonly logger = new Logger(KiuService.name);
  private readonly kiuUrl: string;
  private readonly timeout: number;

  constructor(private configService: ConfigService) {
    this.kiuUrl =
      this.configService.get<string>('KIU_URL') ||
      'https://ssl00.kiusys.com/ws3/index.php';
    this.timeout = this.configService.get<number>('KIU_TIMEOUT') || 30000;
  }

  async sendToKiu(
    xmlRequest: string,
    user: string,
    password: string,
  ): Promise<string> {
    const data = new URLSearchParams();
    data.append('user', user);
    data.append('password', password);
    data.append('request', xmlRequest);

    try {
      // Obtener IP pública para logging
      const publicIP = await this.getPublicIP();
      this.logger.log(
        `📤 Sending request to KIU from IP: ${publicIP}`,
      );
      this.logger.debug(`Request XML length: ${xmlRequest.length} characters`);

      const response = await axios.post(
        this.kiuUrl,
        data.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: this.timeout,
        },
      );

      this.logger.log(
        `✅ Response received from KIU (Status: ${response.status})`,
      );
      this.logger.debug(`Response length: ${response.data?.length || 0} characters`);

      // Retornar el XML directamente (el backend principal lo parseará)
      return response.data;
    } catch (error) {
      this.logger.error('❌ Error calling KIU:', error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.code === 'ECONNABORTED') {
          throw new HttpException(
            'Timeout al conectar con KIU. La petición tardó demasiado.',
            HttpStatus.REQUEST_TIMEOUT,
          );
        }

        if (axiosError.response) {
          throw new HttpException(
            `Error en respuesta de KIU: ${axiosError.response.status} ${axiosError.response.statusText}`,
            axiosError.response.status || HttpStatus.BAD_GATEWAY,
          );
        }

        if (axiosError.request) {
          throw new HttpException(
            'No se pudo conectar con KIU. Verifica la conectividad.',
            HttpStatus.BAD_GATEWAY,
          );
        }
      }

      throw new HttpException(
        `Error al enviar la solicitud al servicio web: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getPublicIP(): Promise<string> {
    try {
      const response = await axios.get('https://api.ipify.org?format=json', {
        timeout: 5000,
      });
      return response.data.ip;
    } catch (error) {
      this.logger.warn('Could not fetch public IP');
      return 'unknown';
    }
  }
}

