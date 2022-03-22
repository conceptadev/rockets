import { OptionsInterface } from '@concepta/nestjs-common';
import { SwaggerUiSettingsInterface } from './swagger-ui-settings.interface';

export interface SwaggerUiOptionsInterface extends OptionsInterface {
  settings?: SwaggerUiSettingsInterface;
}
