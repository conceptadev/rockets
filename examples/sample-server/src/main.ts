import 'reflect-metadata';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { server } from './app.module';
import { ExceptionsFilter } from '@concepta/rockets';

import helmet from 'helmet';
import { createSampleServerOpenApiDocument } from './swagger/create-openapi-document';

async function bootstrap() {
  const app = await NestFactory.create(server);

  app.use(helmet());
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  });
  // Schema-validated routes (generated CRUD, `/me`, `/auth`) carry their
  // own per-route Standard Schema pipe — a global one is refused at boot.
  // The class-validator pipe stays for the remaining class-DTO routes
  // (`pet-share.controller.ts`).
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const swaggerPath = process.env.SWAGGER_UI_PATH ?? 'api';
  // Same builder call the contract-export spec uses, so the pinned
  // `contract.json` is by construction the document served here.
  SwaggerModule.setup(swaggerPath, app, createSampleServerOpenApiDocument(app));

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ExceptionsFilter(httpAdapterHost));

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Sample server listening on http://localhost:${port}`);
}

bootstrap();
