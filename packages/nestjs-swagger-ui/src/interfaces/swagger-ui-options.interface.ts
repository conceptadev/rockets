import { OptionsInterface } from '@concepta/nestjs-common';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerUiSettingsInterface } from './swagger-ui-settings.interface';

export interface SwaggerUiOptionsInterface extends OptionsInterface {
  settings?: SwaggerUiSettingsInterface;
  documentBuilder?: DocumentBuilder;
}
