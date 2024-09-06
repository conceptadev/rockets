import { Repository } from 'typeorm';
import { FileService } from './file.service';
import { FileStrategyService } from './file-strategy.service';
import { FileCreateDto } from '../dto/file-create.dto';
import { FileQueryException } from '../exceptions/file-query.exception';
import { FileEntityInterface } from '../interfaces/file-entity.interface';
import { mock } from 'jest-mock-extended';
import { FileCreatableInterface } from '@concepta/ts-common';
import { randomUUID } from 'crypto';

describe(FileService.name, () => {
  let fileService: FileService;
  let fileRepo: jest.Mocked<Repository<FileEntityInterface>>;
  let fileStrategyService: jest.Mocked<FileStrategyService>;

  const mockFile: FileEntityInterface = {
    id: randomUUID(),
    serviceKey: 'test-service',
    fileName: 'test.txt',
    contentType: 'application/text',
    uploadUri: 'https://upload.url',
    downloadUrl: 'https://download.url',
    dateCreated: new Date(),
    dateUpdated: new Date(),
    dateDeleted: new Date(),
    version: 1,
  };

  const mockFileCreateDto: FileCreateDto = {
    serviceKey: mockFile.serviceKey,
    fileName: mockFile.fileName,
    contentType: 'application/text',
  };

  beforeEach(() => {
    fileRepo = createMockRepository();
    fileStrategyService = createMockFileStrategyService();
    fileService = new FileService(fileRepo, fileStrategyService);
    fileRepo.create.mockReturnValue(mockFile);
    const mockTransactionalEntityManager = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockReturnValue(mockFile),
      save: jest.fn().mockResolvedValue(mockFile),
    };

    fileRepo.manager.transaction = jest.fn().mockImplementation(async (cb) => {
      return await cb(mockTransactionalEntityManager);
    });
  });

  describe('push', () => {
    it('should create a new file and return upload URL', async () => {
      fileStrategyService.getUploadUrl.mockImplementationOnce(
        (_file: FileCreatableInterface) => {
          return Promise.resolve(mockFile.uploadUri || '');
        },
      );

      const result = await fileService.push(mockFileCreateDto);

      expect(fileStrategyService.getUploadUrl).toHaveBeenCalledWith(mockFile);
      expect(result.uploadUri).toBe(mockFile.uploadUri);
    });
  });

  describe('fetch', () => {
    it('should return download URL for existing file', async () => {
      fileRepo.findOne.mockResolvedValue(mockFile);
      fileStrategyService.getDownloadUrl.mockImplementationOnce(
        (_file: FileCreatableInterface) => {
          return Promise.resolve(mockFile.downloadUrl || '');
        },
      );

      const result = await fileService.fetch({ id: mockFile.id });

      expect(fileRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockFile.id },
      });
      expect(fileStrategyService.getDownloadUrl).toHaveBeenCalledWith(mockFile);
      expect(result.downloadUrl).toBe(mockFile.downloadUrl);
    });

    it('should throw FileQueryException if file not found', async () => {
      fileRepo.findOne.mockResolvedValue(null);

      await expect(fileService.fetch({ id: mockFile.id })).rejects.toThrow(
        FileQueryException,
      );
      expect(fileRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockFile.id },
      });
    });
  });
});

function createMockRepository(): jest.Mocked<Repository<FileEntityInterface>> {
  return mock<Repository<FileEntityInterface>>();
}

function createMockFileStrategyService(): jest.Mocked<FileStrategyService> {
  return mock<FileStrategyService>();
}
