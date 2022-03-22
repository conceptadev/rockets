import { OptionsInterface } from '@concepta/nestjs-common';
import {
  ExternalDocumentationObject,
  SecurityRequirementObject,
  SecuritySchemeObject,
  ServerVariableObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import {
  ExpressSwaggerCustomOptions,
  FastifySwaggerCustomOptions,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';

export interface SwaggerUiSettingsInterface extends OptionsInterface {
  path: string;
  title?: string;
  description?: string;
  version?: string;
  termsOfService?: string;
  contact?: { name: string; url: string; email: string };
  license?: { name: string; url: string };
  servers?: {
    url: string;
    description?: string;
    variables?: Record<string, ServerVariableObject>;
  }[];
  externalDoc?: { description: string; url: string };
  basePath?: string;
  tags?: {
    name: string;
    description?: string;
    externalDocs?: ExternalDocumentationObject;
  }[];
  security?: { name: string; options: SecuritySchemeObject }[];
  securityRequirements?: {
    name: string | SecurityRequirementObject;
    requirements?: string[];
  }[];
  bearerAuth?: { options?: SecuritySchemeObject; name?: string }[];
  oAuth2?: { options?: SecuritySchemeObject; name?: string }[];
  apiKeys?: { options?: SecuritySchemeObject; name?: string }[];
  basicAuth?: { options?: SecuritySchemeObject; name?: string }[];
  cookieAuth?: {
    cookieName?: string;
    options?: SecuritySchemeObject;
    securityName?: string;
  }[];
  documentOptions?: SwaggerDocumentOptions;
  customOptions?: ExpressSwaggerCustomOptions | FastifySwaggerCustomOptions;
}
