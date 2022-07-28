import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createSettingsProvider } from '@concepta/nestjs-common';

import { swaggerUiDefaultConfig } from './config/swagger-ui-default.config';
import { SwaggerUiOptionsInterface } from './interfaces/swagger-ui-options.interface';
import { SwaggerUiSettingsInterface } from './interfaces/swagger-ui-settings.interface';
import {
  SWAGGER_UI_MODULE_DOCUMENT_BUILDER_TOKEN,
  SWAGGER_UI_MODULE_OPTIONS_TOKEN,
  SWAGGER_UI_MODULE_SETTINGS_TOKEN,
} from './swagger-ui.constants';
import { createDefaultDocumentBuilder } from './utils/create-default-document-builder';
import { SwaggerUiOptionsExtrasInterface } from './interfaces/swagger-ui-options-extras.interface';

export const {
  ConfigurableModuleClass: SwaggerUiModuleClass,
  OPTIONS_TYPE: SWAGGER_UI_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: SWAGGER_UI_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<SwaggerUiOptionsInterface>({
  moduleName: 'SwaggerUi',
  optionsInjectionToken: SWAGGER_UI_MODULE_OPTIONS_TOKEN,
})
  .setExtras<SwaggerUiOptionsExtrasInterface>(
    {
      global: false,
    },
    definitionTransform,
  )
  .build();

function definitionTransform(
  definition: DynamicModule,
  extras: SwaggerUiOptionsExtrasInterface,
): DynamicModule {
  const { providers = [] } = definition;

  return {
    ...definition,
    ...extras,
    imports: [ConfigModule.forFeature(swaggerUiDefaultConfig)],
    providers: [
      ...providers,
      createSwaggerUiSettingsProvider(),
      createSwaggerUiDocumentBuilderProvider(),
    ],
    exports: [
      ConfigModule,
      SWAGGER_UI_MODULE_OPTIONS_TOKEN,
      SWAGGER_UI_MODULE_SETTINGS_TOKEN,
    ],
  };
}

export function createSwaggerUiSettingsProvider(): Provider {
  return createSettingsProvider<
    SwaggerUiSettingsInterface,
    SwaggerUiOptionsInterface
  >({
    settingsToken: SWAGGER_UI_MODULE_SETTINGS_TOKEN,
    optionsToken: SWAGGER_UI_MODULE_OPTIONS_TOKEN,
    settingsKey: swaggerUiDefaultConfig.KEY,
  });
}

export function createSwaggerUiDocumentBuilderProvider(): Provider {
  return {
    provide: SWAGGER_UI_MODULE_DOCUMENT_BUILDER_TOKEN,
    inject: [SWAGGER_UI_MODULE_OPTIONS_TOKEN, SWAGGER_UI_MODULE_SETTINGS_TOKEN],
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
  };
}
