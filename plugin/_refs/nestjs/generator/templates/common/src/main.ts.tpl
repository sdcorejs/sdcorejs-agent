import 'reflect-metadata';
import { json } from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadEnv } from './config/env';

async function bootstrap(): Promise<void> {
  const env = loadEnv(process.env);
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: env.globalBodyLimit }));
  app.enableCors({
    credentials: env.corsCredentials,
    origin: env.corsOrigins,
  });
  await app.listen(env.port);
}

void bootstrap();
