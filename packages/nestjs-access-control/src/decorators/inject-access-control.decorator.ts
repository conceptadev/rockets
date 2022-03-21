import { Inject } from '@nestjs/common';
import { ACCESS_CONTROL_MODULE_OPTIONS_TOKEN } from '../constants';

export const InjectAccessControl = (): ReturnType<typeof Inject> =>
  Inject(ACCESS_CONTROL_MODULE_OPTIONS_TOKEN);
