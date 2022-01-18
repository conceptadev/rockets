import { DecorateControllerOptionsInterface } from '@rockts-org/nestjs-common';

export interface AuthLocalCtrlDecInterface
  extends DecorateControllerOptionsInterface {
  request?: {
    login?: unknown;
  };
}
