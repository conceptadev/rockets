import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import {
  LookupService,
  QueryOptionsInterface,
  RepositoryInterface,
} from '@concepta/typeorm-common';
import { Injectable } from '@nestjs/common';

import { FILE_MODULE_FILE_ENTITY_KEY } from '../file.constants';
import { FileEntityInterface } from '../interfaces/file-entity.interface';
import { FileLookupServiceInterface } from '../interfaces/file-lookup-service.interface';
import { FileInterface } from '@concepta/nestjs-common';
import { FileServiceKeyMissingException } from '../exceptions/file-service-key-missing.exception';
import { FilenameMissingException } from '../exceptions/file-name-missing.exception';

/**
 * File lookup service
 */
@Injectable()
export class FileLookupService
  extends LookupService<FileEntityInterface>
  implements FileLookupServiceInterface
{
  constructor(
    @InjectDynamicRepository(FILE_MODULE_FILE_ENTITY_KEY)
    repo: RepositoryInterface<FileEntityInterface>,
  ) {
    super(repo);
  }
  async getUniqueFile(
    file: Pick<FileInterface, 'serviceKey' | 'fileName'>,
    queryOptions?: QueryOptionsInterface,
  ) {
    if (!file.serviceKey) {
      throw new FileServiceKeyMissingException();
    }
    if (!file.fileName) {
      throw new FilenameMissingException();
    }
    return this.findOne(
      {
        where: {
          serviceKey: file.serviceKey,
          fileName: file.fileName,
        },
      },
      queryOptions,
    );
  }
}
