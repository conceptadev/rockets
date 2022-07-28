import { DynamicModule, Module } from '@nestjs/common';
import { SwaggerUiService } from './swagger-ui.service';
import {
  SwaggerUiModuleClass,
  SWAGGER_UI_ASYNC_OPTIONS_TYPE,
  SWAGGER_UI_OPTIONS_TYPE,
} from './swagger-ui.module-definition';

@Module({
  providers: [SwaggerUiService],
  exports: [SwaggerUiService],
})
export class SwaggerUiModule extends SwaggerUiModuleClass {
  static register(
    options: Omit<typeof SWAGGER_UI_OPTIONS_TYPE, 'global'>,
  ): DynamicModule {
    return super.register(options);
  }

  static registerAsync(
    options: Omit<typeof SWAGGER_UI_ASYNC_OPTIONS_TYPE, 'global'>,
  ): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(
    options: Omit<typeof SWAGGER_UI_OPTIONS_TYPE, 'global'>,
  ): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(
    options: Omit<typeof SWAGGER_UI_ASYNC_OPTIONS_TYPE, 'global'>,
  ): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }
}
