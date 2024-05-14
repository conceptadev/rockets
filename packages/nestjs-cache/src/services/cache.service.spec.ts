import { CacheCreatableInterface, CacheInterface } from '@concepta/ts-common';
import {
  QueryOptionsInterface,
  ReferenceMutateException,
  ReferenceValidationException,
  RepositoryProxy,
} from '@concepta/typeorm-common';
import { mock } from 'jest-mock-extended';
import { CacheService } from './cache.service';
import { Repository } from 'typeorm';
import { CacheSettingsInterface } from '../interfaces/cache-settings.interface';

import { CacheCreateDto } from '../dto/cache-create.dto';
import { ReferenceAssignment } from '@concepta/ts-core';

describe('CacheService', () => {
  let service: CacheService;
  let repo: Repository<CacheInterface>;
  let settings: CacheSettingsInterface;
  const cache: CacheCreatableInterface = {
    key: 'testKey',
    type: 'testType',
    data: 'testData',
    assignee: { id: 'testAssignee' },
    expiresIn: '1h',
  };
  const queryOptions: QueryOptionsInterface = {};
  const assignment: ReferenceAssignment = 'testAssignment';
  const cacheCreateDto = new CacheCreateDto();
  const repoProxyMock = mock<RepositoryProxy<CacheInterface>>();
  const expirationDate = new Date();

  beforeEach(() => {
    repo = mock<Repository<CacheInterface>>();
    settings = mock<CacheSettingsInterface>();
    settings.expiresIn = '1h';
    service = new CacheService({ testAssignment: repo }, settings);
    
    expirationDate.setHours(expirationDate.getHours() + 1);
  });

  describe(CacheService.prototype.create, () => {
    it('should create a cache entry', async () => {
      Object.assign(cacheCreateDto, cache);

      
      repoProxyMock.repository.mockReturnValue(repo);

      // Mocking validateDto method
      service['validateDto'] = jest.fn().mockResolvedValue(cacheCreateDto);

      // Mocking getExpirationDate method
      service['getExpirationDate'] = jest.fn().mockReturnValue(expirationDate);

      // Mocking RepositoryProxy class
      jest.spyOn(RepositoryProxy.prototype, 'repository').mockReturnValue(repo);

      await service.create(assignment, cache, queryOptions);

      expect(repo.save).toHaveBeenCalledWith({
        key: cache.key,
        type: cache.type,
        data: cache.data,
        assignee: cache.assignee,
        expirationDate,
      });
    });

    it('should throw a ReferenceValidationException on error', async () => {
      const assignment: ReferenceAssignment = 'testAssignment';

      const error = new ReferenceValidationException('error', []);
      service['validateDto'] = jest.fn().mockRejectedValue(error);

      await expect(
        service.create(assignment, cache, queryOptions),
      ).rejects.toThrow(ReferenceValidationException);
    });

    it('should throw a ReferenceMutateException on error', async () => {
      const assignment: ReferenceAssignment = 'testAssignment';

      const error = new ReferenceValidationException('error', []);

      service['getExpirationDate'] = () => {
        throw error;
      };

      const t = async () =>
        await service.create(assignment, cache, queryOptions);
      expect(t).rejects.toThrow(ReferenceMutateException);
    });
  });

  describe(CacheService.prototype.update, () => {
    it('should create a cache entry', async () => {
      Object.assign(cacheCreateDto, cache);

      repoProxyMock.repository.mockReturnValue(repo);

      service['validateDto'] = jest.fn();
      service['findCache'] = jest.fn();
      const result = {
        key: cache.key,
        type: cache.type,
        data: cache.data,
        assignee: cache.assignee,
        expirationDate,
      };
      service['mergeEntity'] = jest.fn().mockResolvedValue(result);

      jest.spyOn(RepositoryProxy.prototype, 'repository').mockReturnValue(repo);

      await service.update(assignment, cache, queryOptions);

      expect(repo.save).toHaveBeenCalledWith(result);
    });

    it('should throw a ReferenceValidationException on error', async () => {
      const assignment: ReferenceAssignment = 'testAssignment';

      const error = new ReferenceValidationException('error', []);
      service['validateDto'] = jest.fn().mockRejectedValue(error);

      await expect(
        service.update(assignment, cache, queryOptions),
      ).rejects.toThrow(ReferenceValidationException);
    });

    it('should throw a ReferenceMutateException on error', async () => {
      const assignment: ReferenceAssignment = 'testAssignment';

      const error = new Error('error');
      service['mergeEntity'] = jest.fn().mockResolvedValue(error);

      const t = () => service.update(assignment, cache, queryOptions);
      await expect(t).rejects.toThrow(ReferenceMutateException);
    });
  });
});
