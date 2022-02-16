import { registerAs } from '@nestjs/config';
import { CrudSettingsInterface } from '../interfaces/crud-settings.interface';
import { CRUD_MODULE_DEFAULT_SETTINGS_TOKEN } from '../crud.constants';

/**
 * Default configuration for crud.
 */
export const crudDefaultConfig = registerAs(
  CRUD_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): CrudSettingsInterface => ({}),
);
