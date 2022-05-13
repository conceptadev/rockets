import { OptionsInterface } from '@concepta/ts-core';

import {
  ExpressSwaggerCustomOptions,
  FastifySwaggerCustomOptions,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';

export interface SwaggerUiSettingsInterface extends OptionsInterface {
  // ui
  path: string;
  documentOptions?: SwaggerDocumentOptions;
  customOptions?: ExpressSwaggerCustomOptions | FastifySwaggerCustomOptions;
  // document builder
  title?: string;
  description?: string;
  version?: string;
  termsOfService?: string;
  contact?: { name: string; url: string; email: string };
  license?: { name: string; url: string };
  basePath?: string;
}
