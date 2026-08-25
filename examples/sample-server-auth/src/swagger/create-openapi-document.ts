import type { INestApplication } from '@nestjs/common';
import type { OpenAPIObject } from '@nestjs/swagger';
import { SwaggerUiService } from '@concepta/rockets-core';

/**
 * Builds the exact OpenAPI document this app serves.
 *
 * `main.ts` mounts the UI with `SwaggerUiService.setup(app)`, which builds its
 * document through `SwaggerUiService.createDocument(app)` — the same call
 * below. So the document returned here is the served document, and the
 * contract specs can pin it without re-implementing the bootstrap.
 *
 * Unlike `examples/sample-server`, this app has no post-processing pass: it
 * registers class-based `defineResource` resources only, so there is no
 * nestjs-zod `cleanupOpenApiDoc` step and no request-body patch.
 */
export function createSampleServerAuthOpenApiDocument(
  app: INestApplication,
): OpenAPIObject {
  const swaggerUiService = app.get(SwaggerUiService);
  swaggerUiService.builder().addBearerAuth();

  return swaggerUiService.createDocument(app);
}
