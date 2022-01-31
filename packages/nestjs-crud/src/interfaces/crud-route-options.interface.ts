import {
  CreateOneRouteOptions,
  DeleteOneRouteOptions,
  RecoverOneRouteOptions,
  ReplaceOneRouteOptions,
  UpdateOneRouteOptions,
} from '@nestjsx/crud';

export interface CrudCreateOneOptionsInterface
  extends Pick<CreateOneRouteOptions, 'returnShallow'> {}

export interface CrudUpdateOneOptionsInterface
  extends Pick<UpdateOneRouteOptions, 'returnShallow'> {}

export interface CrudReplaceOneOptionsInterface
  extends Pick<ReplaceOneRouteOptions, 'returnShallow'> {}

export interface CrudDeleteOneOptionsInterface
  extends Pick<DeleteOneRouteOptions, 'returnDeleted'> {}

export interface CrudRecoverOneOptionsInterface
  extends Pick<RecoverOneRouteOptions, 'returnRecovered'> {}
