import { RoleException } from './role.exception';

export class RoleMissingEntitiesOptionsException extends RoleException {
  constructor() {
    super({
      message: 'You must provide the entities option',
    });
    this.errorCode = 'ROLE_MISSING_ENTITIES_OPTION';
  }
}
