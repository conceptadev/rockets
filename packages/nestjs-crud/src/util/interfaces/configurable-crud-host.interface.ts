import { ClassProvider, Type } from '@nestjs/common';
import { DeepPartial, ObjectLiteral } from 'typeorm';
import { CrudBaseController } from '../../controllers/crud-base.controller';
import { TypeOrmCrudService } from '../../services/typeorm-crud.service';
import { ConfigurableCrudDecorators } from './configurable-crud-decorators.interface';

export interface ConfigurableCrudHost<
  Entity extends ObjectLiteral,
  Creatable extends DeepPartial<Entity>,
  Updatable extends DeepPartial<Entity>,
  Replaceable extends Creatable = Creatable,
> extends ConfigurableCrudDecorators {
  ConfigurableControllerClass: typeof CrudBaseController<
    Entity,
    Creatable,
    Updatable,
    Replaceable
  >;
  ConfigurableServiceClass: Type<TypeOrmCrudService<Entity>>;
  ConfigurableServiceProvider: ClassProvider;
}
