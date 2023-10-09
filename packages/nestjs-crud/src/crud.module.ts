import { DynamicModule, Module } from '@nestjs/common';
import {
  createCrudExports,
  createCrudImports,
  createCrudProviders,
  CrudAsyncOptions,
  CrudModuleClass,
  CrudOptions,
} from './crud.module-definition';

@Module({})
export class CrudModule extends CrudModuleClass {
  static register(options: CrudOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: CrudAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: CrudOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: CrudAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }

  static forFeature(options: CrudOptions): DynamicModule {
    return {
      module: CrudModule,
      imports: createCrudImports(options),
      providers: createCrudProviders({ overrides: options }),
      exports: createCrudExports(),
    };
  }
}
