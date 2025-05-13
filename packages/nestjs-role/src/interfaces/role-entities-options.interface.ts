import { ROLE_MODULE_ROLE_ASSIGNMENT_KEY } from '../role.constants';

export interface RoleEntitiesOptionsInterface {
  entities: {
    // TODO: do we actually need this? we can get it from settings
    [ROLE_MODULE_ROLE_ASSIGNMENT_KEY]?: string[];
  };
}
