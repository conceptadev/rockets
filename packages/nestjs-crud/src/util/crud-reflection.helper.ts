import { Reflector } from '@nestjs/core';
import { CrudOptions, ModelOptions, ParamsOptions } from '@nestjsx/crud';
import {
  CRUD_MODULE_ROUTE_ACTION_METADATA,
  CRUD_MODULE_ROUTE_CREATE_ONE_METADATA,
  CRUD_MODULE_ROUTE_DELETE_ONE_METADATA,
  CRUD_MODULE_ROUTE_MODEL_METADATA,
  CRUD_MODULE_ROUTE_RECOVER_ONE_METADATA,
  CRUD_MODULE_ROUTE_REPLACE_ONE_METADATA,
  CRUD_MODULE_ROUTE_UPDATE_ONE_METADATA,
  CRUD_MODULE_ROUTE_VALIDATION_METADATA,
  CRUD_MODULE_ROUTE_PARAMS_METADATA,
  CRUD_MODULE_ROUTE_QUERY_ALLOW_METADATA,
  CRUD_MODULE_ROUTE_QUERY_EXCLUDE_METADATA,
  CRUD_MODULE_ROUTE_QUERY_PERSIST_METADATA,
  CRUD_MODULE_ROUTE_QUERY_FILTER_METADATA,
  CRUD_MODULE_ROUTE_QUERY_JOIN_METADATA,
  CRUD_MODULE_ROUTE_QUERY_SORT_METADATA,
  CRUD_MODULE_ROUTE_QUERY_LIMIT_METADATA,
  CRUD_MODULE_ROUTE_QUERY_MAX_LIMIT_METADATA,
  CRUD_MODULE_ROUTE_QUERY_CACHE_METADATA,
  CRUD_MODULE_ROUTE_QUERY_ALWAYS_PAGINATE_METADATA,
  CRUD_MODULE_ROUTE_QUERY_SOFT_DELETE_METADATA,
} from '../crud.constants';
import { CrudActions } from '../crud.enums';
import { CrudValidationOptions } from '../crud.types';
import { CrudQueryOptionsInterface } from '../interfaces/crud-query-options.interface';
import {
  CrudCreateOneOptionsInterface,
  CrudDeleteOneOptionsInterface,
  CrudRecoverOneOptionsInterface,
  CrudReplaceOneOptionsInterface,
  CrudUpdateOneOptionsInterface,
} from '../interfaces/crud-route-options.interface';

// eslint-disable-next-line @typescript-eslint/ban-types
type ReflectionTargetOrHandler = Function;

export class CrudReflectionHelper {
  private reflector = new Reflector();

  public getRequestOptions(
    target: ReflectionTargetOrHandler,
    handler: ReflectionTargetOrHandler,
  ): CrudOptions {
    return {
      model: this.reflector.getAllAndOverride<ModelOptions>(
        CRUD_MODULE_ROUTE_MODEL_METADATA,
        [handler, target],
      ),

      validation: this.getValidationOptions(target, handler),

      params: this.reflector.getAllAndOverride<ParamsOptions>(
        CRUD_MODULE_ROUTE_PARAMS_METADATA,
        [handler, target],
      ) ?? {
        id: {
          field: 'id',
          type: 'number',
          primary: true,
        },
      },

      routes: {
        createOneBase: {
          returnShallow: false,
          ...(this.reflector.get<CrudCreateOneOptionsInterface>(
            CRUD_MODULE_ROUTE_CREATE_ONE_METADATA,
            handler,
          ) ?? {}),
        },
        replaceOneBase: {
          returnShallow: false,
          ...(this.reflector.get<CrudReplaceOneOptionsInterface>(
            CRUD_MODULE_ROUTE_REPLACE_ONE_METADATA,
            handler,
          ) ?? {}),
        },
        updateOneBase: {
          returnShallow: false,
          ...(this.reflector.get<CrudUpdateOneOptionsInterface>(
            CRUD_MODULE_ROUTE_UPDATE_ONE_METADATA,
            handler,
          ) ?? {}),
        },
        deleteOneBase: {
          returnDeleted: false,
          ...(this.reflector.get<CrudDeleteOneOptionsInterface>(
            CRUD_MODULE_ROUTE_DELETE_ONE_METADATA,
            handler,
          ) ?? {}),
        },
        recoverOneBase: {
          returnRecovered: false,
          ...(this.reflector.get<CrudRecoverOneOptionsInterface>(
            CRUD_MODULE_ROUTE_RECOVER_ONE_METADATA,
            handler,
          ) ?? {}),
        },
      },

      query: {
        allow: this.reflector.getAllAndOverride<
          CrudQueryOptionsInterface['allow']
        >(CRUD_MODULE_ROUTE_QUERY_ALLOW_METADATA, [handler, target]),

        exclude: this.reflector.getAllAndOverride<
          CrudQueryOptionsInterface['exclude']
        >(CRUD_MODULE_ROUTE_QUERY_EXCLUDE_METADATA, [handler, target]),

        persist: this.reflector.getAllAndOverride<
          CrudQueryOptionsInterface['persist']
        >(CRUD_MODULE_ROUTE_QUERY_PERSIST_METADATA, [handler, target]),

        filter:
          this.reflector.getAllAndOverride<CrudQueryOptionsInterface['filter']>(
            CRUD_MODULE_ROUTE_QUERY_FILTER_METADATA,
            [handler, target],
          ) ?? {},

        join: this.reflector.getAllAndOverride<
          CrudQueryOptionsInterface['join']
        >(CRUD_MODULE_ROUTE_QUERY_JOIN_METADATA, [handler, target]),

        sort: this.reflector.getAllAndOverride<
          CrudQueryOptionsInterface['sort']
        >(CRUD_MODULE_ROUTE_QUERY_SORT_METADATA, [handler, target]),

        limit: this.reflector.getAllAndOverride<
          CrudQueryOptionsInterface['limit']
        >(CRUD_MODULE_ROUTE_QUERY_LIMIT_METADATA, [handler, target]),

        maxLimit: this.reflector.getAllAndOverride<
          CrudQueryOptionsInterface['maxLimit']
        >(CRUD_MODULE_ROUTE_QUERY_MAX_LIMIT_METADATA, [handler, target]),

        cache: this.reflector.getAllAndOverride<
          CrudQueryOptionsInterface['cache']
        >(CRUD_MODULE_ROUTE_QUERY_CACHE_METADATA, [handler, target]),

        alwaysPaginate: this.reflector.getAllAndOverride<
          CrudQueryOptionsInterface['alwaysPaginate']
        >(CRUD_MODULE_ROUTE_QUERY_ALWAYS_PAGINATE_METADATA, [handler, target]),

        softDelete: this.reflector.getAllAndOverride<
          CrudQueryOptionsInterface['softDelete']
        >(CRUD_MODULE_ROUTE_QUERY_SOFT_DELETE_METADATA, [handler, target]),
      },
    };
  }

  public getAction(handler: ReflectionTargetOrHandler): CrudActions {
    return this.reflector.get<CrudActions>(
      CRUD_MODULE_ROUTE_ACTION_METADATA,
      handler,
    );
  }

  public getValidationOptions(
    target: ReflectionTargetOrHandler,
    handler: ReflectionTargetOrHandler,
  ): CrudValidationOptions {
    // route options
    const routeOptions = this.reflector.get(
      CRUD_MODULE_ROUTE_VALIDATION_METADATA,
      handler,
    );
    // controller options
    const ctrlOptions = this.reflector.get(
      CRUD_MODULE_ROUTE_VALIDATION_METADATA,
      target,
    );
    // merge them
    return this.mergeValidationOptions(routeOptions, ctrlOptions);
  }

  public mergeValidationOptions(
    options: CrudValidationOptions,
    defaultOptions: CrudValidationOptions,
  ): CrudValidationOptions {
    let mergedOptions: CrudValidationOptions;

    if (options === false) {
      mergedOptions = false;
    } else if (options) {
      if (defaultOptions) {
        mergedOptions = { ...defaultOptions, ...options };
      } else {
        mergedOptions = options;
      }
    } else {
      mergedOptions = defaultOptions;
    }

    return mergedOptions;
  }
}
