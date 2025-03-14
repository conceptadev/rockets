import { FederatedException } from './federated.exception';

export class FederatedMissingEntitiesOptionsException extends FederatedException {
  constructor() {
    super({
      message: 'You must provide the entities option',
    });
    this.errorCode = 'FEDERATED_MISSING_ENTITIES_OPTION';
  }
}
