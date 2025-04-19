import { Injectable } from '@nestjs/common';
import {
  FileCreatableInterface,
  RepositoryInterface,
} from '@concepta/nestjs-common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { MutateService } from '@concepta/typeorm-common';
import { FileEntityInterface } from '../interfaces/file-entity.interface';

import { FileCreateDto } from '../dto/file-create.dto';
import { FileMutateServiceInterface } from '../interfaces/file-mutate-service.interface';
import { FILE_MODULE_FILE_ENTITY_KEY } from '../file.constants';

/**
 * File mutate service
 */
@Injectable()
export class FileMutateService
  extends MutateService<
    FileEntityInterface,
    FileCreatableInterface,
    FileCreatableInterface
  >
  implements FileMutateServiceInterface
{
  protected createDto = FileCreateDto;
  protected updateDto = FileCreateDto;

  /**
   * Constructor
   *
   * @param repo - instance of the file repo
   */
  constructor(
    @InjectDynamicRepository(FILE_MODULE_FILE_ENTITY_KEY)
    repo: RepositoryInterface<FileEntityInterface>,
  ) {
    super(repo);
  }
}
