import { Inject } from '@nestjs/common';
import { ACCESS_CONTROL_OPTIONS_KEY } from '../constants';

export const InjectAccessControl = (): ReturnType<typeof Inject> =>
  Inject(ACCESS_CONTROL_OPTIONS_KEY);
