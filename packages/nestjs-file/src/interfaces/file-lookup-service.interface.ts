import { FileCreatableInterface, FileInterface } from '@concepta/nestjs-common';
import { LookupIdInterface, ReferenceId } from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface FileLookupServiceInterface
  extends LookupIdInterface<ReferenceId, FileInterface, QueryOptionsInterface> {
  getUniqueFile(
    org: Pick<FileCreatableInterface, 'serviceKey' | 'fileName'>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<FileInterface | null>;
}
