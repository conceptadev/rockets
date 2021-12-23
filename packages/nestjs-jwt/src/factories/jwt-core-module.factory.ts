import {
  ConfigAsyncInterface,
  ConfigInterface,
  ModuleFactoryInterface,
} from '@rockts-org/nestjs-common';
import { JWT_MODULE_OPTIONS_TOKEN, jwtOptions } from '../config/jwt.config';

import { JwtCoreModule } from '../jwt-core.module';
import { JwtOptionsInterface } from '../interfaces/jwt-options.interface';

export class JwtCoreModuleFactory
  implements ModuleFactoryInterface<JwtOptionsInterface>
{
  forRoot(config: ConfigInterface<JwtOptionsInterface>) {
    return {
      module: JwtCoreModule,
      imports: config?.imports,
      providers: [
        {
          provide: JWT_MODULE_OPTIONS_TOKEN,
          useValue: config?.options || jwtOptions(),
        },
      ],
      exports: [JWT_MODULE_OPTIONS_TOKEN],
    };
  }

  forRootAsync(config: ConfigAsyncInterface<JwtOptionsInterface>) {
    return {
      module: JwtCoreModule,
      imports: config?.imports,
      providers: [
        {
          provide: JWT_MODULE_OPTIONS_TOKEN,
          inject: config?.inject,
          useFactory: config?.useFactory,
        },
      ],
      exports: [JWT_MODULE_OPTIONS_TOKEN],
    };
  }
}
