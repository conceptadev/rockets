import { ControllerOptions, Post, Type } from '@nestjs/common';

export interface DecorateControllerOptionsInterface {
  route?: ControllerOptions;
  request?: {
    [key: string]: {
      route?: Parameters<typeof Post>[0];
      dto?: Type;
    };
  };
}
