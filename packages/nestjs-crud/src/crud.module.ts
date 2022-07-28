import { DynamicModule, Module } from '@nestjs/common';
import { CrudOptionsInterface } from './interfaces/crud-options.interface';
import { CrudReflectionService } from './services/crud-reflection.service';
import {
  createCrudImports,
  createCrudProviders,
  CrudModuleClass,
  CRUD_ASYNC_OPTIONS_TYPE,
  CRUD_OPTIONS_TYPE,
} from './crud.module-definition';
import { CrudOptionsExtrasInterface } from './interfaces/crud-options-extras.interface';

@Module({
  providers: [CrudReflectionService],
  exports: [CrudReflectionService],
})
export class CrudModule extends CrudModuleClass {
  static register(
    options: Omit<typeof CRUD_OPTIONS_TYPE, 'global'>,
  ): DynamicModule {
    return super.register(options);
  }

  static registerAsync(
    options: Omit<typeof CRUD_ASYNC_OPTIONS_TYPE, 'global'>,
  ): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(
    options: Omit<typeof CRUD_OPTIONS_TYPE, 'global'>,
  ): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(
    options: Omit<typeof CRUD_ASYNC_OPTIONS_TYPE, 'global'>,
  ): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }

  static forFeature(
    options: CrudOptionsInterface & Pick<CrudOptionsExtrasInterface, 'imports'>,
  ): DynamicModule {
    return {
      module: CrudModule,
      imports: createCrudImports(options),
      providers: createCrudProviders({ overrides: options }),
    };
  }
}
