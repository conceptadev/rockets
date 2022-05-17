import { Module } from '@nestjs/common';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
} from '@concepta/nestjs-core';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { SwaggerUiOptionsInterface } from './interfaces/swagger-ui-options.interface';
import { SwaggerUiSettingsInterface } from './interfaces/swagger-ui-settings.interface';
import { SwaggerUiService } from './swagger-ui.service';
import {
  SWAGGER_UI_MODULE_DOCUMENT_BUILDER_TOKEN,
  SWAGGER_UI_MODULE_OPTIONS_TOKEN,
  SWAGGER_UI_MODULE_SETTINGS_TOKEN,
} from './swagger-ui.constants';
import { swaggerUiDefaultConfig } from './config/swagger-ui-default.config';
import { createDefaultDocumentBuilder } from './utils/create-default-document-builder';

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
    {
      provide: SWAGGER_UI_MODULE_DOCUMENT_BUILDER_TOKEN,
      inject: [
        SWAGGER_UI_MODULE_OPTIONS_TOKEN,
        SWAGGER_UI_MODULE_SETTINGS_TOKEN,
      ],
      useFactory: async (
        options: SwaggerUiOptionsInterface,
        settings: SwaggerUiSettingsInterface,
      ) => {
        // did they set a document builder?
        if (options.documentBuilder) {
          // yes, return it
          return options.documentBuilder;
        } else {
          // no, create one from defaults
          return createDefaultDocumentBuilder(settings);
        }
      },
    },
  ],
  exports: [SWAGGER_UI_MODULE_SETTINGS_TOKEN],
}) {
  static register(options: SwaggerUiOptionsInterface = {}) {
    return SwaggerUiModule.forRoot(SwaggerUiModule, options);
  }

  static registerAsync(options: AsyncModuleConfig<SwaggerUiOptionsInterface>) {
    return SwaggerUiModule.forRootAsync(SwaggerUiModule, options);
  }

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<SwaggerUiModule, SwaggerUiOptionsInterface>(
      SwaggerUiModule,
      options,
    );
  }
}
