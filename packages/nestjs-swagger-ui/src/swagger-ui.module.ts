import { Module } from '@nestjs/common';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
} from '@rockts-org/nestjs-common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { SwaggerUiOptionsInterface } from './interfaces/swagger-ui-options.interface';
import {
  SWAGGER_UI_MODULE_OPTIONS_TOKEN,
  SWAGGER_UI_MODULE_SETTINGS_TOKEN,
} from './swagger-ui.constants';
import { swaggerUiDefaultConfig } from './config/swagger-ui-default.config';
import { SwaggerUiService } from './swagger-ui.service';

@Module({
  providers: [SwaggerUiService],
  exports: [SwaggerUiService],
})
export class SwaggerUiModule extends createConfigurableDynamicRootModule<
  SwaggerUiModule,
  SwaggerUiOptionsInterface
>(SWAGGER_UI_MODULE_OPTIONS_TOKEN, {
  imports: [ConfigModule.forFeature(swaggerUiDefaultConfig)],
  providers: [
    {
      provide: SWAGGER_UI_MODULE_SETTINGS_TOKEN,
      inject: [SWAGGER_UI_MODULE_OPTIONS_TOKEN, swaggerUiDefaultConfig.KEY],
      useFactory: async (
        options: SwaggerUiOptionsInterface,
        defaultSettings: ConfigType<typeof swaggerUiDefaultConfig>,
      ) => options?.settings ?? defaultSettings,
    },
  ],
  exports: [SWAGGER_UI_MODULE_SETTINGS_TOKEN],
}) {
  static register(options: SwaggerUiOptionsInterface = {}) {
    return SwaggerUiModule.forRoot(SwaggerUiModule, options);
  }

  static registerAsync(options: AsyncModuleConfig<SwaggerUiOptionsInterface>) {
    return SwaggerUiModule.forRootAsync(SwaggerUiModule, {
      useFactory: () => ({}),
      ...options,
    });
  }

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<SwaggerUiModule, SwaggerUiOptionsInterface>(
      SwaggerUiModule,
      options,
    );
  }
}
