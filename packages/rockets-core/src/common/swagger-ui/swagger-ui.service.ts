import { Inject, INestApplication, Injectable } from '@nestjs/common';
import {
  DocumentBuilder,
  OpenAPIObject,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';

import { SwaggerUiSettingsInterface } from './interfaces/swagger-ui-settings.interface';
import {
  SWAGGER_UI_MODULE_DOCUMENT_BUILDER_TOKEN,
  SWAGGER_UI_MODULE_SETTINGS_TOKEN,
} from './swagger-ui.constants';

@Injectable()
export class SwaggerUiService {
  constructor(
    @Inject(SWAGGER_UI_MODULE_SETTINGS_TOKEN)
    protected readonly settings: SwaggerUiSettingsInterface,
    @Inject(SWAGGER_UI_MODULE_DOCUMENT_BUILDER_TOKEN)
    protected readonly documentBuilder: DocumentBuilder,
  ) {}

  builder(): DocumentBuilder {
    return this.documentBuilder;
  }

  /**
   * Builds the OpenAPI document without mounting the UI.
   *
   * This is the single seam every document consumer must go through —
   * `setup()` below, and anything that needs the document itself (a pinned
   * `contract.json` artifact, a structural test, an offline export). Building
   * a document by hand from `builder().build()` instead re-implements the
   * argument list and silently drifts from what the app serves the moment
   * `documentOptions` changes.
   *
   * @param app - Nest application to scan for routes.
   * @param documentOptions - Overrides the configured
   * `settings.documentOptions` when provided; apps that need per-call
   * `extraModels` pass them here.
   */
  createDocument(
    app: INestApplication,
    documentOptions?: SwaggerDocumentOptions,
  ): OpenAPIObject {
    return SwaggerModule.createDocument(
      app,
      this.documentBuilder.build(),
      documentOptions ?? this.settings?.documentOptions,
    );
  }

  setup(app: INestApplication): void {
    SwaggerModule.setup(
      this.settings.path,
      app,
      this.createDocument(app),
      this.settings?.customOptions,
    );
  }
}
