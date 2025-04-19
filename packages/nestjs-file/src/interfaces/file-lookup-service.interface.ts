import {
  ByIdInterface,
  ReferenceId,
  FileCreatableInterface,
  FileInterface,
} from '@concepta/nestjs-common';

export interface FileLookupServiceInterface
  extends ByIdInterface<ReferenceId, FileInterface> {
  getUniqueFile(
    org: Pick<FileCreatableInterface, 'serviceKey' | 'fileName'>,
  ): Promise<FileInterface | null>;
}
