import { Test, TestingModule } from '@nestjs/testing';
import { FederatedService } from './federated.service';
import { RepositoryInterface } from '@concepta/nestjs-common';
import { FederatedEntityInterface } from '@concepta/nestjs-common';
import { FederatedQueryException } from '../exceptions/federated-query.exception';
import { FEDERATED_MODULE_FEDERATED_ENTITY_KEY } from '../federated.constants';
import { getDynamicRepositoryToken } from '@concepta/nestjs-common';

describe(FederatedService.name, () => {
  let service: FederatedService;
  let repo: RepositoryInterface<FederatedEntityInterface>;

  beforeEach(async () => {
    const mockRepo = {
      findOne: jest.fn(),
      entityName: () => 'FederatedEntity',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FederatedService,
        {
          provide: getDynamicRepositoryToken(
            FEDERATED_MODULE_FEDERATED_ENTITY_KEY,
          ),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<FederatedService>(FederatedService);
    repo = module.get(
      getDynamicRepositoryToken(FEDERATED_MODULE_FEDERATED_ENTITY_KEY),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe(FederatedService.prototype.exists.name, () => {
    it('should return federated entity when it exists', async () => {
      // Arrange
      const provider = 'google';
      const subject = '123456';
      const expectedEntity = {
        id: '1',
        provider,
        subject,
      } as FederatedEntityInterface;
      jest.spyOn(repo, 'findOne').mockResolvedValue(expectedEntity);

      // Act
      const result = await service.exists(provider, subject);

      // Assert
      expect(result).toBe(expectedEntity);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: {
          provider,
          subject,
        },
      });
    });

    it('should return null when federated entity does not exist', async () => {
      // Arrange
      const provider = 'google';
      const subject = '123456';
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);

      // Act
      const result = await service.exists(provider, subject);

      // Assert
      expect(result).toBeNull();
      expect(repo.findOne).toHaveBeenCalledWith({
        where: {
          provider,
          subject,
        },
      });
    });

    it('should throw FederatedQueryException when repository throws an error', async () => {
      // Arrange
      const provider = 'google';
      const subject = '123456';
      const error = new Error('Database error');
      jest.spyOn(repo, 'findOne').mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      let thrownError: unknown;
      try {
        await service.exists(provider, subject);
      } catch (e) {
        thrownError = e;
      }

      expect(thrownError).toBeDefined();
      expect(thrownError).toBeInstanceOf(FederatedQueryException);
      expect((thrownError as FederatedQueryException).context.entityName).toBe(
        'FederatedEntity',
      );
      expect(repo.findOne).toHaveBeenCalledWith({
        where: {
          provider,
          subject,
        },
      });
    });

    it('should throw FederatedQueryException when repository throws a non-Error object', async () => {
      // Arrange
      const provider = 'google';
      const subject = '123456';
      const error = 'Database error';
      jest.spyOn(repo, 'findOne').mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      let thrownError: unknown;
      try {
        await service.exists(provider, subject);
      } catch (e) {
        thrownError = e;
      }

      expect(thrownError).toBeDefined();
      expect(thrownError).toBeInstanceOf(FederatedQueryException);
      expect((thrownError as FederatedQueryException).context.entityName).toBe(
        'FederatedEntity',
      );
      expect(repo.findOne).toHaveBeenCalledWith({
        where: {
          provider,
          subject,
        },
      });
    });
  });
});
