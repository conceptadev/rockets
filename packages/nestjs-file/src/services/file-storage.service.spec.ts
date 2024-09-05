import { FileStorageService } from './file-storage.service';
import { StorageServiceInterface } from '../interfaces/storage-service.interface';
import { FileCreateDto } from '../dto/file-create.dto';
import { FileStorageServiceNotFoundException } from '../exceptions/file-storage-service-not-found.exception';

class MockStorageService implements StorageServiceInterface {
  KEY = 'mock-service';

  uploadTimeout = 4000;

  getUploadUrl(file: FileCreateDto): string {
    return `http://upload.url/${file.serviceKey}/${file.fileName}`;
  }

  getDownloadUrl(file: FileCreateDto): string {
    return `http://download.url/${file.serviceKey}/${file.fileName}`;
  }
}

describe(FileStorageService.name, () => {
  let fileStorageService: FileStorageService;
  let mockStorageService: StorageServiceInterface;

  beforeEach(() => {
    fileStorageService = new FileStorageService();
    mockStorageService = new MockStorageService();
  });

  describe(FileStorageService.prototype.addStorageService.name, () => {
    it('should add a storage service', () => {
      fileStorageService.addStorageService(mockStorageService);
      expect(fileStorageService['storageServices']).toContain(
        mockStorageService,
      );
    });
  });

  describe(FileStorageService.prototype.getUploadUrl.name, () => {
    it('should return the upload URL from the correct storage service', async () => {
      const mockFile = new FileCreateDto();
      mockFile.serviceKey = 'mock-service';
      mockFile.fileName = 'test.jpg';
      fileStorageService.addStorageService(mockStorageService);

      const result = await fileStorageService.getUploadUrl(mockFile);

      expect(result).toBe('http://upload.url/mock-service/test.jpg');
    });
  });

  describe(FileStorageService.prototype.getDownloadUrl.name, () => {
    it('should return the download URL from the correct storage service', async () => {
      const mockFile = new FileCreateDto();
      mockFile.serviceKey = 'mock-service';
      mockFile.fileName = 'test.jpg';
      fileStorageService.addStorageService(mockStorageService);

      const result = await fileStorageService.getDownloadUrl(mockFile);

      expect(result).toBe('http://download.url/mock-service/test.jpg');
    });
  });

  describe(FileStorageService.prototype.resolveStorageService.name, () => {
    it('should return the correct storage service for a given file', async () => {
      const mockFile = new FileCreateDto();
      mockFile.serviceKey = 'mock-service';
      fileStorageService.addStorageService(mockStorageService);

      const result = await fileStorageService.resolveStorageService(mockFile);

      expect(result).toBe(mockStorageService);
    });

    it('should throw FileStorageServiceNotFoundException if no matching service is found', () => {
      const mockFile = new FileCreateDto();
      mockFile.serviceKey = 'non-existent-service';

      expect(() => fileStorageService.resolveStorageService(mockFile)).toThrow(
        FileStorageServiceNotFoundException,
      );
    });
  });
});
