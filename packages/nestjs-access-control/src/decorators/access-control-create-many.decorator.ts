import { AccessControlFilterCallback } from '../interfaces/access-control-filter-option.interface';
import { AccessControlGrantResource } from '../interfaces/access-control-grant-option.interface';
import { AccessControlCreateOne } from './access-control-create-one.decorator';

/**
 * Create many resource filter shortcut.
 *
 * @param {AccessControlGrantResource} resource The grant resource.
 * @param {AccessControlFilterCallback} paramFilter An optional param filter.
 */
export const AccessControlCreateMany = (
  resource: AccessControlGrantResource,
  paramFilter?: AccessControlFilterCallback,
) => AccessControlCreateOne(resource, paramFilter);
