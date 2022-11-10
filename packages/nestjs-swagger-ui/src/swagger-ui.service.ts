import fs from 'fs';
import { Readable } from 'stream';
import { INestApplication, Inject, Injectable } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import toJsonSchema from '@openapi-contrib/openapi-schema-to-json-schema';

import { SwaggerUiSettingsInterface } from './interfaces/swagger-ui-settings.interface';
import {
  SWAGGER_UI_MODULE_SETTINGS_TOKEN,
  SWAGGER_UI_MODULE_DOCUMENT_BUILDER_TOKEN,
} from './swagger-ui.constants';
import { bufferToStream, writeObjectInAFile } from './utils/file-utils';

@Injectable()
export class SwaggerUiService {
  /**
   * Constructor.
   *
   * @param settings swagger ui settings
   * @param documentBuilder
   */
  constructor(
    @Inject(SWAGGER_UI_MODULE_SETTINGS_TOKEN)
    private settings: SwaggerUiSettingsInterface,
    @Inject(SWAGGER_UI_MODULE_DOCUMENT_BUILDER_TOKEN)
    private documentBuilder: DocumentBuilder,
  ) {}

  /**
   * Returns document builder instance.
   */
  builder(): DocumentBuilder {
    return this.documentBuilder;
  }

  /**
   * Setup.
   *
   * @param app Nest application instance
   */
  setup(app: INestApplication) {
    // create the document
    const document = SwaggerModule.createDocument(
      app,
      this.documentBuilder.build(),
      this.settings?.documentOptions,
    );

    // finally, set it up
    SwaggerModule.setup(
      this.settings.path,
      app,
      document,
      this.settings?.customOptions,
    );

    this.saveApiAndJsonSchemas(document);
  }

  async getJsonSchema(): Promise<Readable> {
    return await this.readFile(this.settings.jsonSchemaFilePath);
  }

  async getOpenApi(): Promise<Readable> {
    return await this.readFile(this.settings.openApiFilePath);
  }

  async saveApiAndJsonSchemas(document: OpenAPIObject) {
    const convertedSchema = toJsonSchema(document);
    const { schemas } = convertedSchema?.components ?? {};

    writeObjectInAFile(this.settings.openApiFilePath, document);
    writeObjectInAFile(this.settings.jsonSchemaFilePath, schemas);
  }

  private async readFile(filePath: string): Promise<Readable> {
    const buffer = await fs.promises.readFile(filePath);

    return bufferToStream(buffer);
  }
}
