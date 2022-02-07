import { Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CrudOptions } from '@nestjsx/crud';
import {
  CRUD_MODULE_CTRL_OPTIONS_METADATA,
  CRUD_MODULE_ROUTE_ACTION_METADATA,
  CRUD_MODULE_ROUTE_CREATE_ONE_METADATA,
  CRUD_MODULE_ROUTE_DELETE_ONE_METADATA,
  CRUD_MODULE_ROUTE_MODEL_METADATA,
  CRUD_MODULE_ROUTE_RECOVER_ONE_METADATA,
  CRUD_MODULE_ROUTE_REPLACE_ONE_METADATA,
  CRUD_MODULE_ROUTE_UPDATE_ONE_METADATA,
  CRUD_MODULE_ROUTE_VALIDATION_METADATA,
  CRUD_MODULE_ROUTE_QUERY_METADATA,
} from '../crud.constants';
import { CrudActions } from '../crud.enums';
import { CrudValidationOptions } from '../crud.types';
import { CrudCtrlOptionsInterface } from '../interfaces/crud-ctrl-options.interface';
import { CrudQueryOptionsInterface } from '../interfaces/crud-query-options.interface';
import {
  CrudCreateOneOptionsInterface,
  CrudDeleteOneOptionsInterface,
  CrudRecoverOneOptionsInterface,
  CrudReplaceOneOptionsInterface,
  CrudUpdateOneOptionsInterface,
} from '../interfaces/crud-route-options.interface';

// eslint-disable-next-line @typescript-eslint/ban-types
type ReflectionHandler = Function;

export class CrudReflectionHelper {
  private reflector = new Reflector();

  public getRequestOptions(
    target: Type,
    handler: ReflectionHandler,
  ): CrudOptions {
    const ctrlOptions = this.getControllerOptions(target);
    const queryOptions = this.getQueryOptions(handler);

    return {
      model: {
        ...ctrlOptions?.model,
        ...this.getModelOptions(handler),
      },
      validation: this.getMergedValidationOptions(
        this.getValidationOptions,
        ctrlOptions.validation,
      ),
      routes: {
        createOneBase: {
          returnShallow: false,
          ...this.getCreateOneOptions(handler),
        },
        replaceOneBase: {
          returnShallow: false,
          ...this.getReplaceOneOptions(handler),
        },
        updateOneBase: {
          returnShallow: false,
          ...this.getUpdateOneOptions(handler),
        },
        deleteOneBase: {
          returnDeleted: false,
          ...this.getDeleteOneOptions(handler),
        },
        recoverOneBase: {
          returnRecovered: false,
          ...this.getRecoverOneOptions(handler),
        },
      },
      query: { filter: {}, ...queryOptions },
    };
  }

  public getAction(handler: ReflectionHandler): CrudActions {
    return this.reflector.get<CrudActions>(
      CRUD_MODULE_ROUTE_ACTION_METADATA,
      handler,
    );
  }

  public getMergedValidationOptions(
    handler: ReflectionHandler,
    defaultOptions: CrudValidationOptions,
  ): CrudValidationOptions {
    const routeOptions = this.getValidationOptions(handler);
    return this.mergeValidationOptions(routeOptions, defaultOptions);
  }

  public mergeValidationOptions(
    options: CrudValidationOptions,
    defaultOptions: CrudValidationOptions,
  ): CrudValidationOptions {
    let mergedOptions;

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

  protected getControllerOptions(target: Type): CrudCtrlOptionsInterface {
    return this.reflector.get<CrudCtrlOptionsInterface>(
      CRUD_MODULE_CTRL_OPTIONS_METADATA,
      target,
    );
  }

  protected getValidationOptions(
    handler: ReflectionHandler,
  ): CrudValidationOptions {
    return this.reflector.get<CrudValidationOptions>(
      CRUD_MODULE_ROUTE_VALIDATION_METADATA,
      handler,
    );
  }

  protected getQueryOptions(
    handler: ReflectionHandler,
  ): CrudQueryOptionsInterface {
    return (
      this.reflector.get<CrudQueryOptionsInterface>(
        CRUD_MODULE_ROUTE_QUERY_METADATA,
        handler,
      ) ?? {}
    );
  }

  protected getModelOptions(
    handler: ReflectionHandler,
  ): CrudCtrlOptionsInterface['model'] {
    return this.reflector.get<CrudCtrlOptionsInterface['model']>(
      CRUD_MODULE_ROUTE_MODEL_METADATA,
      handler,
    );
  }

  protected getCreateOneOptions(
    handler: ReflectionHandler,
  ): CrudCreateOneOptionsInterface {
    return (
      this.reflector.get<CrudCreateOneOptionsInterface>(
        CRUD_MODULE_ROUTE_CREATE_ONE_METADATA,
        handler,
      ) ?? {}
    );
  }

  protected getReplaceOneOptions(
    handler: ReflectionHandler,
  ): CrudReplaceOneOptionsInterface {
    return (
      this.reflector.get<CrudReplaceOneOptionsInterface>(
        CRUD_MODULE_ROUTE_REPLACE_ONE_METADATA,
        handler,
      ) ?? {}
    );
  }

  protected getUpdateOneOptions(
    handler: ReflectionHandler,
  ): CrudUpdateOneOptionsInterface {
    return (
      this.reflector.get<CrudUpdateOneOptionsInterface>(
        CRUD_MODULE_ROUTE_UPDATE_ONE_METADATA,
        handler,
      ) ?? {}
    );
  }

  protected getDeleteOneOptions(
    handler: ReflectionHandler,
  ): CrudDeleteOneOptionsInterface {
    return (
      this.reflector.get<CrudDeleteOneOptionsInterface>(
        CRUD_MODULE_ROUTE_DELETE_ONE_METADATA,
        handler,
      ) ?? {}
    );
  }

  protected getRecoverOneOptions(
    handler: ReflectionHandler,
  ): CrudRecoverOneOptionsInterface {
    return (
      this.reflector.get<CrudRecoverOneOptionsInterface>(
        CRUD_MODULE_ROUTE_RECOVER_ONE_METADATA,
        handler,
      ) ?? {}
    );
  }
}
