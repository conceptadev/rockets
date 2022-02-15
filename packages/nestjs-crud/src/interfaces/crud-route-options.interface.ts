import {
  CreateOneRouteOptions,
  DeleteOneRouteOptions,
  RecoverOneRouteOptions,
  ReplaceOneRouteOptions,
  UpdateOneRouteOptions,
} from '@nestjsx/crud';

export interface CrudRouteOptionsInterface {
  path?: string | string[];
}

export interface CrudCreateManyOptionsInterface
  extends CrudRouteOptionsInterface {}

export interface CrudCreateOneOptionsInterface
  extends CrudRouteOptionsInterface,
    Pick<CreateOneRouteOptions, 'returnShallow'> {}

export interface CrudReadAllOptionsInterface
  extends CrudRouteOptionsInterface {}

export interface CrudReadOneOptionsInterface
  extends CrudRouteOptionsInterface {}

export interface CrudUpdateOneOptionsInterface
  extends CrudRouteOptionsInterface,
    Pick<UpdateOneRouteOptions, 'returnShallow'> {}

export interface CrudReplaceOneOptionsInterface
  extends CrudRouteOptionsInterface,
    Pick<ReplaceOneRouteOptions, 'returnShallow'> {}

export interface CrudDeleteOneOptionsInterface
  extends CrudRouteOptionsInterface,
    Pick<DeleteOneRouteOptions, 'returnDeleted'> {}

export interface CrudRecoverOneOptionsInterface
  extends CrudRouteOptionsInterface,
    Pick<RecoverOneRouteOptions, 'returnRecovered'> {}
