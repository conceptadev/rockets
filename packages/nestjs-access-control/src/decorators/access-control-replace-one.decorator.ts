import { AccessControlFilterCallback } from '../interfaces/access-control-filter-option.interface';
import { AccessControlGrantResource } from '../interfaces/access-control-grant-option.interface';
import { AccessControlUpdateOne } from './access-control-update-one.decorator';

/**
 * Update one resource filter shortcut
 *
 * @param {AccessControlGrantResource} resource The grant resource.
 * @param {AccessControlFilterCallback} paramFilter An optional param filter.
 */
export const AccessControlReplaceOne = (
  resource: AccessControlGrantResource,
  paramFilter?: AccessControlFilterCallback,
) => AccessControlUpdateOne(resource, paramFilter);
