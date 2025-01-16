import { ReferenceQueryOptionsInterface } from '../../../reference/interfaces/reference-query-options.interface';
import { AuthenticatedUserRequestInterface } from './authenticated-info.interface';

export interface AuthenticatedEventInterface {
  userInfo: AuthenticatedUserRequestInterface;
  queryOptions?: ReferenceQueryOptionsInterface;
}
