import { InvitationException } from './invitation.exception';

export class InvitationMissingEntitiesOptionsException extends InvitationException {
  constructor() {
    super({
      message: 'You must provide the entities option',
    });
    this.errorCode = 'INVITATION_MISSING_ENTITIES_OPTION';
  }
}
