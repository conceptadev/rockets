import { randomUUID } from 'crypto';
import { DeepPartial, ObjectLiteral, Repository } from 'typeorm';
import { applyDecorators, Inject, Type } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { CrudCreateMany } from '../decorators/actions/crud-create-many.decorator';
import { CrudCreateOne } from '../decorators/actions/crud-create-one.decorator';
import { CrudDeleteOne } from '../decorators/actions/crud-delete-one.decorator';
import { CrudGetMany } from '../decorators/actions/crud-get-many.decorator';
import { CrudGetOne } from '../decorators/actions/crud-get-one.decorator';
import { CrudRecoverOne } from '../decorators/actions/crud-recover-one.decorator';
import { CrudReplaceOne } from '../decorators/actions/crud-replace-one.decorator';
import { CrudUpdateOne } from '../decorators/actions/crud-update-one.decorator';
import { CrudController } from '../decorators/controller/crud-controller.decorator';
import { CrudBody } from '../decorators/params/crud-body.decorator';
import { CrudRequest } from '../decorators/params/crud-request.decorator';
import { CrudRequestInterface } from '../interfaces/crud-request.interface';
import { CrudCreateManyInterface } from '../interfaces/crud-create-many.interface';
import { TypeOrmCrudService } from '../services/typeorm-crud.service';
import { CrudBaseController } from '../controllers/crud-base.controller';
import { ConfigurableCrudDecorators } from './interfaces/configurable-crud-decorators.interface';
import { ConfigurableCrudHost } from './interfaces/configurable-crud-host.interface';
import { ConfigurableCrudOptions } from './interfaces/configurable-crud-options.interface';
import { ConfigurableCrudOptionsTransformer } from '../crud.types';

export class ConfigurableCrudBuilder<
  Entity extends ObjectLiteral,
  Creatable extends DeepPartial<Entity>,
  Updatable extends DeepPartial<Entity>,
  Replaceable extends Creatable = Creatable,
  ExtraOptions extends ObjectLiteral = ObjectLiteral,
> {
  private extras: ExtraOptions;
  private optionsTransform: ConfigurableCrudOptionsTransformer<ExtraOptions>;

  constructor(private options: ConfigurableCrudOptions) {
    this.extras = {} as ExtraOptions;
    this.optionsTransform = (options, _extras) => options;
  }

  setExtras(
    extras: ExtraOptions,
    optionsTransform: ConfigurableCrudOptionsTransformer<ExtraOptions>,
  ): ConfigurableCrudBuilder<
    Entity,
    Creatable,
    Updatable,
    Replaceable,
    ExtraOptions
  > {
    this.extras = extras;
    this.optionsTransform = optionsTransform;
    return this;
  }

  build(): ConfigurableCrudHost<Entity, Creatable, Updatable, Replaceable> {
    const options = this.optionsTransform(this.options, this.extras);
    const decorators = this.generateDecorators(options);
    const ConfigurableServiceClass = this.generateService<Entity>(
      options.service,
    );
    const ConfigurableControllerClass = this.generateClass(options, decorators);

    return {
      ConfigurableServiceProvider: {
        provide: options.service.injectionToken,
        useClass: ConfigurableServiceClass,
      },
      ConfigurableServiceClass,
      ConfigurableControllerClass,
      ...decorators,
    };
  }

  private generateDecorators<O extends ConfigurableCrudOptions>(
    options: O,
  ): ConfigurableCrudDecorators {
    const {
      controller,
      getMany,
      getOne,
      createMany,
      createOne,
      updateOne,
      replaceOne,
      deleteOne,
      recoverOne,
    } = options;

    const operationIdPrefix =
      (Array.isArray(options.controller?.path)
        ? options.controller?.path.join()
        : options.controller?.path
      )?.replace(/[^\w]/g, '_') ?? randomUUID();

    return {
      CrudController: applyDecorators(
        CrudController(controller),
        ...(controller?.extraDecorators ?? []),
      ),
      CrudGetMany: applyDecorators(
        CrudGetMany({
          api: { operation: { operationId: `${operationIdPrefix}_getMany` } },
          ...getMany,
        }),
        ...(getMany?.extraDecorators ?? []),
      ),
      CrudGetOne: applyDecorators(
        CrudGetOne({
          api: { operation: { operationId: `${operationIdPrefix}_getOne` } },
          ...getOne,
        }),
        ...(getOne?.extraDecorators ?? []),
      ),
      CrudCreateMany: applyDecorators(
        CrudCreateMany({
          api: {
            operation: { operationId: `${operationIdPrefix}_createMany` },
          },
          ...createMany,
        }),
        ...(createMany?.extraDecorators ?? []),
      ),
      CrudCreateOne: applyDecorators(
        CrudCreateOne({
          api: { operation: { operationId: `${operationIdPrefix}_createOne` } },
          ...createOne,
        }),
        ...(createOne?.extraDecorators ?? []),
      ),
      CrudUpdateOne: applyDecorators(
        CrudUpdateOne({
          api: { operation: { operationId: `${operationIdPrefix}_updateOne` } },
          ...updateOne,
        }),
        ...(updateOne?.extraDecorators ?? []),
      ),
      CrudReplaceOne: applyDecorators(
        CrudReplaceOne({
          api: {
            operation: { operationId: `${operationIdPrefix}_replaceOne` },
          },
          ...replaceOne,
        }),
        ...(replaceOne?.extraDecorators ?? []),
      ),
      CrudDeleteOne: applyDecorators(
        CrudDeleteOne({
          api: { operation: { operationId: `${operationIdPrefix}_deleteOne` } },
          ...deleteOne,
        }),
        ...(deleteOne?.extraDecorators ?? []),
      ),
      CrudRecoverOne: applyDecorators(
        CrudRecoverOne({
          api: {
            operation: { operationId: `${operationIdPrefix}_recoverOne` },
          },
          ...recoverOne,
        }),
        ...(recoverOne?.extraDecorators ?? []),
      ),
    };
  }

  private generateClass<O extends ConfigurableCrudOptions>(
    options: O,
    decorators: ConfigurableCrudDecorators,
  ): typeof CrudBaseController<Entity, Creatable, Updatable, Replaceable> {
    const {
      CrudController,
      CrudGetMany,
      CrudGetOne,
      CrudCreateMany,
      CrudCreateOne,
      CrudUpdateOne,
      CrudReplaceOne,
      CrudDeleteOne,
      CrudRecoverOne,
    } = decorators;

    class InternalCrudClass extends CrudBaseController<
      Entity,
      Creatable,
      Updatable,
      Replaceable
    > {
      constructor(
        @Inject(options.service.injectionToken)
        protected crudService: TypeOrmCrudService<Entity>,
      ) {
        super(crudService);
      }
    }

    if (options?.getMany) {
      InternalCrudClass.prototype.getMany = async function (
        this: InternalCrudClass,
        crudRequest: CrudRequestInterface,
      ) {
        return this.crudService.getMany(crudRequest);
      };

      CrudGetMany(
        InternalCrudClass.prototype,
        'getMany',
        Object.getOwnPropertyDescriptor(InternalCrudClass.prototype, 'getMany'),
      );
      CrudRequest()(InternalCrudClass.prototype, 'getMany', 0);
    }

    if (options?.getOne) {
      InternalCrudClass.prototype.getOne = async function (
        this: InternalCrudClass,
        crudRequest: CrudRequestInterface,
      ) {
        return this.crudService.getOne(crudRequest);
      };

      CrudGetOne(
        InternalCrudClass.prototype,
        'getOne',
        Object.getOwnPropertyDescriptor(InternalCrudClass.prototype, 'getOne'),
      );
      CrudRequest()(InternalCrudClass.prototype, 'getOne', 0);
    }

    if (options?.createMany) {
      InternalCrudClass.prototype.createMany = async function (
        this: InternalCrudClass,
        crudRequest: CrudRequestInterface,
        createManyDto: CrudCreateManyInterface<Creatable>,
      ) {
        return this.crudService.createMany(crudRequest, createManyDto);
      };

      CrudCreateMany(
        InternalCrudClass.prototype,
        'createMany',
        Object.getOwnPropertyDescriptor(
          InternalCrudClass.prototype,
          'createMany',
        ),
      );
      CrudRequest()(InternalCrudClass.prototype, 'createMany', 0);
      CrudBody()(InternalCrudClass.prototype, 'createMany', 1);
    }

    if (options?.createOne) {
      InternalCrudClass.prototype.createOne = async function (
        this: InternalCrudClass,
        crudRequest: CrudRequestInterface,
        createDto: Creatable,
      ) {
        return this.crudService.createOne(crudRequest, createDto);
      };

      CrudCreateOne(
        InternalCrudClass.prototype,
        'createOne',
        Object.getOwnPropertyDescriptor(
          InternalCrudClass.prototype,
          'createOne',
        ),
      );
      CrudRequest()(InternalCrudClass.prototype, 'createOne', 0);
      CrudBody()(InternalCrudClass.prototype, 'createOne', 1);
    }

    if (options?.updateOne) {
      InternalCrudClass.prototype.updateOne = async function (
        this: InternalCrudClass,
        crudRequest: CrudRequestInterface,
        updateDto: Updatable,
      ) {
        return this.crudService.updateOne(crudRequest, updateDto);
      };

      CrudUpdateOne(
        InternalCrudClass.prototype,
        'updateOne',
        Object.getOwnPropertyDescriptor(
          InternalCrudClass.prototype,
          'updateOne',
        ),
      );
      CrudRequest()(InternalCrudClass.prototype, 'updateOne', 0);
      CrudBody()(InternalCrudClass.prototype, 'updateOne', 1);
    }

    if (options?.replaceOne) {
      InternalCrudClass.prototype.replaceOne = async function (
        this: InternalCrudClass,
        crudRequest: CrudRequestInterface,
        replaceDto: Replaceable,
      ) {
        return this.crudService.replaceOne(crudRequest, replaceDto);
      };

      CrudReplaceOne(
        InternalCrudClass.prototype,
        'replaceOne',
        Object.getOwnPropertyDescriptor(
          InternalCrudClass.prototype,
          'replaceOne',
        ),
      );
      CrudRequest()(InternalCrudClass.prototype, 'replaceOne', 0);
      CrudBody()(InternalCrudClass.prototype, 'replaceOne', 1);
    }

    if (options?.deleteOne) {
      InternalCrudClass.prototype.deleteOne = async function (
        this: InternalCrudClass,
        crudRequest: CrudRequestInterface,
      ) {
        return this.crudService.deleteOne(crudRequest);
      };

      CrudDeleteOne(
        InternalCrudClass.prototype,
        'deleteOne',
        Object.getOwnPropertyDescriptor(
          InternalCrudClass.prototype,
          'deleteOne',
        ),
      );
      CrudRequest()(InternalCrudClass.prototype, 'deleteOne', 0);
    }

    if (options?.recoverOne) {
      InternalCrudClass.prototype.recoverOne = async function (
        this: InternalCrudClass,
        crudRequest: CrudRequestInterface,
      ) {
        return this.crudService.recoverOne(crudRequest);
      };

      CrudRecoverOne(
        InternalCrudClass.prototype,
        'recoverOne',
        Object.getOwnPropertyDescriptor(
          InternalCrudClass.prototype,
          'recoverOne',
        ),
      );
      CrudRequest()(InternalCrudClass.prototype, 'recoverOne', 0);
    }

    CrudController(InternalCrudClass);

    return InternalCrudClass;
  }

  private generateService<Entity extends ObjectLiteral>(
    options: ConfigurableCrudOptions['service'],
  ): Type<TypeOrmCrudService<Entity>> {
    // standard repository injection style
    if ('entity' in options && options.entity) {
      const { entity } = options;

      class InternalServiceClass extends TypeOrmCrudService<Entity> {
        constructor(
          @InjectRepository(entity)
          protected readonly repo: Repository<Entity>,
        ) {
          super(repo);
        }
      }

      return InternalServiceClass;
    } else {
      // EXT repository injection style
      const { entityKey } = options;

      class InternalServiceClass extends TypeOrmCrudService<Entity> {
        constructor(
          @InjectDynamicRepository(entityKey)
          protected readonly repo: Repository<Entity>,
        ) {
          super(repo);
        }
      }

      return InternalServiceClass;
    }
  }
}
