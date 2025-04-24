import { mock } from 'jest-mock-extended';
import { ReferenceAssignment } from '@concepta/nestjs-common';
import {
  CacheCreatableInterface,
  CacheInterface,
  RepositoryInterface,
  ModelMutateException,
  ModelValidationException,
} from '@concepta/nestjs-common';

import { CacheService } from './cache.service';
import { CacheSettingsInterface } from '../interfaces/cache-settings.interface';
import { CacheCreateDto } from '../dto/cache-create.dto';

const expirationDate = new Date();
expirationDate.setHours(expirationDate.getHours() + 1);

jest.mock('../utils/get-expiration-date.util', () => ({
  __esModule: true,
  default: jest.fn(() => expirationDate),
}));

describe('CacheService', () => {
  let service: CacheService;
  let repo: RepositoryInterface<CacheInterface>;
  let settings: CacheSettingsInterface;
  const cacheDto: CacheCreatableInterface = {
    key: 'testKey',
    type: 'testType',
    data: 'testData',
    assigneeId: 'testAssignee',
    expiresIn: '1h',
  };

  const assignment: ReferenceAssignment = 'testAssignment';
  const cacheCreateDto = new CacheCreateDto();

  beforeEach(() => {
    repo = mock<RepositoryInterface<CacheInterface>>();
    settings = mock<CacheSettingsInterface>();
    settings.assignments = {
      testAssignment: { entityKey: 'testAssignment' },
    };
    settings.expiresIn = '1h';
    service = new CacheService({ testAssignment: repo }, settings);
  });

  describe(CacheService.prototype.create, () => {
    it('should create a cache entry', async () => {
      Object.assign(cacheCreateDto, cacheDto);

      // Mocking validateDto method
      service['validateDto'] = jest.fn().mockResolvedValue(cacheCreateDto);

      await service.create(assignment, cacheDto);

      expect(repo.save).toHaveBeenCalledWith({
        key: cacheDto.key,
        type: cacheDto.type,
        data: cacheDto.data,
        assigneeId: cacheDto.assigneeId,
        expirationDate,
      });
    });

    it('should throw a ModelValidationException on error', async () => {
      const assignment: ReferenceAssignment = 'testAssignment';

      const error = new ModelValidationException('error', []);
      service['validateDto'] = jest.fn().mockRejectedValue(error);

      await expect(service.create(assignment, cacheDto)).rejects.toThrow(
        ModelValidationException,
      );
    });
  });

  describe(CacheService.prototype.update, () => {
    it('should update a cache entry', async () => {
      Object.assign(cacheCreateDto, cacheDto);

      service['validateDto'] = jest.fn().mockResolvedValueOnce(cacheDto);
      const result = {
        key: cacheDto.key,
        type: cacheDto.type,
        data: cacheDto.data,
        assigneeId: cacheDto.assigneeId,
        expirationDate,
      };
      service['findCache'] = jest.fn().mockImplementationOnce(() => {
        return {
          ...result,
          dateCreated: new Date(),
          dateUpdated: new Date(),
          id: 'testId',
          version: 1,
        } as CacheInterface;
      });
      service['mergeEntity'] = jest.fn().mockResolvedValue(result);

      await service.update(assignment, cacheDto);

      expect(repo.save).toHaveBeenCalledWith(result);
    });

    it('should throw a ModelValidationException on error', async () => {
      const assignment: ReferenceAssignment = 'testAssignment';

      const error = new ModelValidationException('error', []);
      service['validateDto'] = jest.fn().mockRejectedValue(error);

      await expect(service.update(assignment, cacheDto)).rejects.toThrow(
        ModelValidationException,
      );
    });

    it('should throw a ModelMutateException on error', async () => {
      const assignment: ReferenceAssignment = 'testAssignment';

      const error = new Error('error');
      service['mergeEntity'] = jest.fn().mockResolvedValue(error);

      const t = () => service.update(assignment, cacheDto);
      await expect(t).rejects.toThrow(ModelMutateException);
    });
  });
});
