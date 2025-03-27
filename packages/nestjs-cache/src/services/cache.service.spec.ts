import { mock } from 'jest-mock-extended';
import { ReferenceAssignment } from '@concepta/nestjs-common';
import {
  CacheCreatableInterface,
  CacheInterface,
} from '@concepta/nestjs-common';
import {
  QueryOptionsInterface,
  ReferenceMutateException,
  ReferenceValidationException,
  RepositoryInterface,
  RepositoryProxy,
  initTypeOrmCommonTranslation,
} from '@concepta/typeorm-common';

import { CacheService } from './cache.service';
import { CacheSettingsInterface } from '../interfaces/cache-settings.interface';
import { CacheCreateDto } from '../dto/cache-create.dto';
import { I18n } from '@concepta/i18n';
import LOCALES from '../locales';

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
    assignee: { id: 'testAssignee' },
    expiresIn: '1h',
  };

  const queryOptions: QueryOptionsInterface = {};
  const assignment: ReferenceAssignment = 'testAssignment';
  const cacheCreateDto = new CacheCreateDto();
  const repoProxyMock = mock<RepositoryProxy<CacheInterface>>();

  beforeEach(() => {
    repo = mock<RepositoryInterface<CacheInterface>>();
    settings = mock<CacheSettingsInterface>();
    settings.assignments = {
      testAssignment: { entityKey: 'testAssignment' },
    };
    settings.expiresIn = '1h';
    service = new CacheService({ testAssignment: repo }, settings);
  });

  afterEach(() => {
    I18n.reset();
  });

  describe(CacheService.prototype.create, () => {
    it('should create a cache entry', async () => {
      Object.assign(cacheCreateDto, cacheDto);

      repoProxyMock.repository.mockReturnValue(repo);

      // Mocking validateDto method
      service['validateDto'] = jest.fn().mockResolvedValue(cacheCreateDto);

      // Mocking RepositoryProxy class
      jest.spyOn(RepositoryProxy.prototype, 'repository').mockReturnValue(repo);

      await service.create(assignment, cacheDto, queryOptions);

      expect(repo.save).toHaveBeenCalledWith({
        key: cacheDto.key,
        type: cacheDto.type,
        data: cacheDto.data,
        assignee: cacheDto.assignee,
        expirationDate,
      });
    });

    it('should throw a ReferenceValidationException on error', async () => {
      const assignment: ReferenceAssignment = 'testAssignment';

      const error = new ReferenceValidationException('error', []);
      service['validateDto'] = jest.fn().mockRejectedValue(error);

      await expect(
        service.create(assignment, cacheDto, queryOptions),
      ).rejects.toThrow(ReferenceValidationException);
    });

    it('should throw a ReferenceMutateException on error', async () => {
      const assignment: ReferenceAssignment = 'testAssignment';

      jest
        .spyOn(RepositoryProxy.prototype, 'repository')
        .mockImplementationOnce(() => {
          throw new Error();
        });

      const t = async () =>
        await service.create(assignment, cacheDto, queryOptions);
      expect(t).rejects.toThrow(ReferenceMutateException);
    });
  });

  describe(CacheService.prototype.update, () => {
    it('should update a cache entry', async () => {
      Object.assign(cacheCreateDto, cacheDto);

      repoProxyMock.repository.mockReturnValue(repo);

      service['validateDto'] = jest.fn().mockResolvedValueOnce(cacheDto);
      const result = {
        key: cacheDto.key,
        type: cacheDto.type,
        data: cacheDto.data,
        assignee: cacheDto.assignee,
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

      jest.spyOn(RepositoryProxy.prototype, 'repository').mockReturnValue(repo);

      await service.update(assignment, cacheDto, queryOptions);

      expect(repo.save).toHaveBeenCalledWith(result);
    });

    it('should throw a ReferenceValidationException on error', async () => {
      const assignment: ReferenceAssignment = 'testAssignment';

      const error = new ReferenceValidationException('error', []);
      service['validateDto'] = jest.fn().mockRejectedValue(error);

      await expect(
        service.update(assignment, cacheDto, queryOptions),
      ).rejects.toThrow(ReferenceValidationException);
    });

    it('should throw a ReferenceMutateException on error with translations in pt', async () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      I18n.init({
        options: {
          initImmediate: false,
          fallbackLng: 'pt',
        },
      });
      // load local translations
      I18n.addTranslations(LOCALES);

      // load typeorm translations
      initTypeOrmCommonTranslation();

      // need to call this to load the translations
      const assignment: ReferenceAssignment = 'testAssignment';

      const error = new Error('error');
      service['mergeEntity'] = jest.fn().mockResolvedValue(error);

      const t = () => service.update(assignment, cacheDto, queryOptions);
      await expect(t).rejects.toThrowError(
        'Erro ao tentar alterar uma referência de undefined',
      );
    });
  });
});
