import { ConfigurableModuleBuilder, DynamicModule } from '@nestjs/common';

import { TYPEORM_EXT_MODULE_OPTIONS_TOKEN } from './typeorm-ext.constants';
import { TypeOrmExtOptions as xTypeOrmExtOptions } from './typeorm-ext.types';

export const {
  ConfigurableModuleClass: TypeOrmExtModuleClass,
  OPTIONS_TYPE: TYPEORM_EXT_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: TYPEORM_EXT_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<xTypeOrmExtOptions>({
  moduleName: 'TypeOrmExt',
  optionsInjectionToken: TYPEORM_EXT_MODULE_OPTIONS_TOKEN,
})
  .setExtras({}, (definition: DynamicModule) => {
    return {
      ...definition,
      global: true,
      exports: [TYPEORM_EXT_MODULE_OPTIONS_TOKEN],
    };
  })
  .setClassMethodName('forRoot')
  .build();

export type TypeOrmExtOptions = typeof TYPEORM_EXT_OPTIONS_TYPE;
export type TypeOrmExtAsyncOptions = typeof TYPEORM_EXT_ASYNC_OPTIONS_TYPE;
