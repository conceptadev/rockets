import { ModuleFactoryInterface } from '@rockts-org/nestjs-common';
import { JwtCoreModule } from '../jwt-core.module';
import { jwtConfig, JWT_MODULE_CONFIG_TOKEN } from '../config/jwt.config';
import {
  JwtAsyncOptionsInterface,
  JwtOptionsInterface,
} from '../interfaces/jwt-options.interface';

export class JwtCoreModuleFactory
  implements ModuleFactoryInterface<JwtAsyncOptionsInterface>
{
  forRoot(options: JwtOptionsInterface) {
    return {
      module: JwtCoreModule,
      imports: options?.imports,
      providers: [
        {
          provide: JWT_MODULE_CONFIG_TOKEN,
          useValue: options || jwtConfig(),
        },
      ],
      exports: [JWT_MODULE_CONFIG_TOKEN],
    };
  }

  forRootAsync(options: JwtAsyncOptionsInterface) {
    return {
      module: JwtCoreModule,
      imports: options?.imports,
      providers: [
        {
          provide: JWT_MODULE_CONFIG_TOKEN,
          inject: options?.inject,
          useFactory: options.useFactory,
        },
      ],
      exports: [JWT_MODULE_CONFIG_TOKEN],
    };
  }
}
