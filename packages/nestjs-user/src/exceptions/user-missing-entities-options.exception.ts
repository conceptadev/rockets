import { UserException } from './user-exception';

export class UserMissingEntitiesOptionsException extends UserException {
  constructor() {
    super({
      message: 'You must provide the entities option',
    });
    this.errorCode = 'USER_MISSING_ENTITIES_OPTION';
  }
}
