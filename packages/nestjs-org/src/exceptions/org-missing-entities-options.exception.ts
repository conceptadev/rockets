import { OrgException } from './org.exception';

export class OrgMissingEntitiesOptionsException extends OrgException {
  constructor() {
    super({
      message: 'You must provide the entities option',
    });
    this.errorCode = 'ORG_MISSING_ENTITIES_OPTION';
  }
}
