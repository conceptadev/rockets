import { DynamicModule, Module } from '@nestjs/common';

import { SwaggerUiService } from './swagger-ui.service';
import {
  SwaggerUiAsyncOptions,
  SwaggerUiModuleClass,
  SwaggerUiOptions,
} from './swagger-ui.module-definition';
import { SchemaController } from './schema.controller';

@Module({
  providers: [SwaggerUiService],
  exports: [SwaggerUiService],
  controllers: [SchemaController],
})
export class SwaggerUiModule extends SwaggerUiModuleClass {
  static register(options: SwaggerUiOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: SwaggerUiAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: SwaggerUiOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: SwaggerUiAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }
}
