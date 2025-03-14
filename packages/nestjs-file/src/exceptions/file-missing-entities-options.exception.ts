import { FileException } from './file.exception';

export class FileMissingEntitiesOptionsException extends FileException {
  constructor() {
    super({
      message: 'You must provide the entities option',
    });
    this.errorCode = 'FILE_MISSING_ENTITIES_OPTION';
  }
}
