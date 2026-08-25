import type { INestApplication } from '@nestjs/common';
import type { OpenAPIObject } from '@nestjs/swagger';
import { SwaggerUiService } from '@concepta/rockets-core';
import { cleanupOpenApiDoc } from 'nestjs-zod';

import { UserMetadataUpdateDto } from '../user-metadata.schema';
import { patchMePatchOpenApi } from './patch-me-openapi';

/**
 * Builds the exact OpenAPI document this app serves at `/api`.
 *
 * `main.ts` and `test/openapi-contract-export.e2e-spec.ts` both call this —
 * that is the point. The document is NOT just
 * `SwaggerModule.createDocument(app, builder.build())`: it also needs the
 * `extraModels` registration, the PATCH `/me` request-body patch, and the
 * nestjs-zod `cleanupOpenApiDoc` pass. A contract artifact generated without
 * those three steps would pin a document the app never serves.
 */
export function createSampleServerOpenApiDocument(
  app: INestApplication,
): OpenAPIObject {
  const swaggerUiService = app.get(SwaggerUiService);
  swaggerUiService.builder().addBearerAuth();

  const document = swaggerUiService.createDocument(app, {
    extraModels: [UserMetadataUpdateDto],
  });
  patchMePatchOpenApi(document, UserMetadataUpdateDto);

  // nestjs-zod DTOs leave internal markers in the raw document; cleanup
  // only rewrites schemas generated from zod DTOs.
  return cleanupOpenApiDoc(document);
}
