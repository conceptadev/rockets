import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { BaseService } from '@concepta/typeorm-common';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { FileInterface } from '@concepta/ts-common';

import {
  FILE_MODULE_FILE_ENTITY_KEY,
  FILE_STORAGE_SERVICE_KEY,
} from '../file.constants';
import { FileEntityInterface } from '../interfaces/file-entity.interface';
import { FileServiceInterface } from '../interfaces/file-service.interface';
import { FileQueryException } from '../exceptions/file-query.exception';
import { FileCreateDto } from '../dto/file-create.dto';
import { FileStorageService } from './file-storage.service';
import { FileMutateCreateUserException } from '../exceptions/file-mutate-create.exception';
import { FileIdMissingException } from '../exceptions/file-id-missing.exception';
import { FileDuplicateEntryException } from '../exceptions/file-duplicated.exception';

@Injectable()
export class FileService
  extends BaseService<FileEntityInterface>
  implements FileServiceInterface
{
  constructor(
    @InjectDynamicRepository(FILE_MODULE_FILE_ENTITY_KEY)
    private fileRepo: Repository<FileEntityInterface>,
    @Inject(FILE_STORAGE_SERVICE_KEY)
    private fileStorageService: FileStorageService,
  ) {
    super(fileRepo);
  }

  async push(file: FileCreateDto): Promise<FileInterface> {
    try {
      return await this.fileRepo.manager.transaction(async (manager) => {
        const existingFile = await manager.findOne(this.fileRepo.target, {
          where: {
            serviceKey: file.serviceKey,
            fileName: file.fileName,
          },
        });
        if (existingFile) {
          throw new FileDuplicateEntryException(file.serviceKey, file.fileName);
        }
        const newFile = manager.create(this.fileRepo.target, file);
        await manager.save(newFile);
        return this.addFileUrls(newFile);
      });
    } catch (err) {
      throw new FileMutateCreateUserException(this.metadata.targetName, err);
    }
  }

  async fetch(file: Pick<FileInterface, 'id'>): Promise<FileInterface> {
    if (!file.id) throw new FileIdMissingException();
    const dbFile = await this.fileRepo.findOne({
      where: {
        id: file.id,
      },
    });
    if (!dbFile) throw new FileQueryException();
    return this.addFileUrls(dbFile);
  }

  private async addFileUrls(file: FileEntityInterface): Promise<FileInterface> {
    file.uploadUri = await this.fileStorageService.getUploadUrl(file);
    file.downloadUrl = await this.fileStorageService.getDownloadUrl(file);
    return file;
  }
}
