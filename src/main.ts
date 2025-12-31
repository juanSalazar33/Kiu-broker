import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || '*';
  app.enableCors({
    origin: corsOrigins === '*' ? true : corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  logger.log(`🚀 KIU Broker microservice running on port ${port}`);
  logger.log(`📡 KIU URL: ${process.env.KIU_URL || 'https://ssl00.kiusys.com/ws3/index.php'}`);
  logger.log(`🌐 CORS Origins: ${corsOrigins}`);
}

bootstrap();

