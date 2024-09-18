import { FileCreatableInterface, FileInterface } from '@concepta/ts-common';
import { LookupIdInterface, ReferenceId } from '@concepta/ts-core';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface FileLookupServiceInterface
  extends LookupIdInterface<ReferenceId, FileInterface, QueryOptionsInterface> {
  getUniqueFile(
    org: Pick<FileCreatableInterface, 'serviceKey' | 'fileName'>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<FileInterface | null>;
}
