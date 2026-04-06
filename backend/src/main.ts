import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import express from 'express';
import { AppModule } from './app.module';
import { createApiProxyMiddleware } from './proxy/api-proxy.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  const configService = app.get(ConfigService);
  const expressApp = app.getHttpAdapter().getInstance();

  // Proxy legacy REST routes before body parsing so multipart requests stay streamable.
  expressApp.use(
    createApiProxyMiddleware(
      configService.get<string>('API_BASE_URL', 'http://localhost:3000'),
    ),
  );
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  const config = new DocumentBuilder()
    .setTitle('Credential Watcher Service')
    .setDescription('Realtime relay and blockchain watcher for Credential Core')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`🚀 Watcher service running on: http://localhost:${port}`);
}
bootstrap();
