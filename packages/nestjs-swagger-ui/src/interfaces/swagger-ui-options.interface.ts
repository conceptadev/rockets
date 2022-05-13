import { DocumentBuilder } from '@nestjs/swagger';
import { OptionsInterface } from '@concepta/ts-core';
import { SwaggerUiSettingsInterface } from './swagger-ui-settings.interface';

export interface SwaggerUiOptionsInterface extends OptionsInterface {
  settings?: SwaggerUiSettingsInterface;
  documentBuilder?: DocumentBuilder;
}
