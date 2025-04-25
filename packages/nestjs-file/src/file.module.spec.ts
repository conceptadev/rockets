import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { DynamicModule, ModuleMetadata } from '@nestjs/common';
import {
  RepositoryInterface,
  getDynamicRepositoryToken,
  getEntityRepositoryToken,
} from '@concepta/nestjs-common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';

import { FileService } from './services/file.service';

import { FILE_MODULE_FILE_ENTITY_KEY } from './file.constants';

import { FileEntityInterface } from './interfaces/file-entity.interface';

import { AwsStorageService } from './__fixtures__/aws-storage.service';
import { FileStorageModuleFixture } from './__fixtures__/file-storage.module.fixture';
import { FileEntityFixture } from './__fixtures__/file/file-entity.fixture';
import { UserEntityFixture } from './__fixtures__/user/entities/user.entity.fixture';
import { FileModule } from './file.module';
import {
  AWS_KEY_FIXTURE,
  DOWNLOAD_URL_FIXTURE,
  FILE_NAME_FIXTURE,
  UPLOAD_URL_FIXTURE,
} from './__fixtures__/constants.fixture';

describe(FileModule, () => {
  let testModule: TestingModule;
  let fileModule: FileModule;
  let fileService: FileService;
  let fileEntityRepo: RepositoryInterface<FileEntityInterface>;
  let fileDynamicRepo: RepositoryInterface<FileEntityInterface>;

  describe(FileModule.forRoot, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          FileModule.forRoot({
            entities: {
              file: {
                entity: FileEntityFixture,
              },
            },
            storageServices: [new AwsStorageService()],
          }),
        ]),
      ).compile();
      commonVars();
    });

    it('module should be loaded', async () => {
      commonTests();
    });
  });

  describe(FileModule.register, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          FileModule.register({
            entities: {
              file: {
                entity: FileEntityFixture,
              },
            },
            storageServices: [new AwsStorageService()],
          }),
        ]),
      ).compile();
      commonVars();
    });

    it('module should be loaded', async () => {
      commonTests();
    });
  });

  describe(FileModule.forRootAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          FileModule.forRootAsync({
            inject: [AwsStorageService],
            useFactory: (awsStorageService: AwsStorageService) => ({
              storageServices: [awsStorageService],
            }),
            entities: {
              file: {
                entity: FileEntityFixture,
              },
            },
          }),
        ]),
      ).compile();
      commonVars();
    });

    it('module should be loaded', async () => {
      commonTests();
    });
    it('make sure to push a new file and get upload and download url', async () => {
      const result = await fileService.push({
        fileName: 'test.pdf',
        serviceKey: AWS_KEY_FIXTURE,
        contentType: 'application/pdf',
      });
      expect(result.uploadUri).toBe(UPLOAD_URL_FIXTURE);
      expect(result.downloadUrl).toBe(DOWNLOAD_URL_FIXTURE);
    });
  });

  describe(FileModule.registerAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          FileModule.registerAsync({
            inject: [AwsStorageService],
            useFactory: (awsStorageService: AwsStorageService) => ({
              storageServices: [awsStorageService],
            }),
            entities: {
              file: {
                entity: FileEntityFixture,
              },
            },
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  const commonVars = () => {
    fileModule = testModule.get(FileModule);
    fileService = testModule.get(FileService);
    fileEntityRepo = testModule.get<RepositoryInterface<FileEntityFixture>>(
      getEntityRepositoryToken(FILE_MODULE_FILE_ENTITY_KEY),
    );
    fileDynamicRepo = testModule.get(
      getDynamicRepositoryToken(FILE_MODULE_FILE_ENTITY_KEY),
    );
  };

  const commonTests = async () => {
    expect(fileModule).toBeInstanceOf(FileModule);
    expect(fileService).toBeInstanceOf(FileService);
    expect(fileEntityRepo).toBeInstanceOf(Repository);
    expect(fileDynamicRepo).toBeInstanceOf(Repository);

    const result = await fileService.push({
      fileName: FILE_NAME_FIXTURE,
      serviceKey: AWS_KEY_FIXTURE,
      contentType: 'application/pdf',
    });
    expect(result.serviceKey).toBe(AWS_KEY_FIXTURE);
    expect(result.fileName).toBe(FILE_NAME_FIXTURE);
    expect(result.uploadUri).toBe(UPLOAD_URL_FIXTURE);
    expect(result.downloadUrl).toBe(DOWNLOAD_URL_FIXTURE);
  };
});

function testModuleFactory(
  extraImports: DynamicModule['imports'] = [],
): ModuleMetadata {
  return {
    imports: [
      TypeOrmExtModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        entities: [UserEntityFixture, FileEntityFixture],
      }),
      FileStorageModuleFixture,
      ...extraImports,
    ],
  };
}
