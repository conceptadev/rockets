import { Test, TestingModule } from '@nestjs/testing';
import { FederatedOAuthService } from './federated-oauth.service';
import { FederatedService } from './federated.service';
import { FederatedModelService } from './federated-model.service';
import { FederatedUserModelServiceInterface } from '../interfaces/federated-user-model-service.interface';
import { FederatedEntityInterface } from '@concepta/nestjs-common';
import { FederatedCredentialsInterface } from '../interfaces/federated-credentials.interface';
import { FederatedCreateUserException } from '../exceptions/federated-create-user.exception';
import { FederatedFindUserException } from '../exceptions/federated-find-user.exception';
import { FederatedUserRelationshipException } from '../exceptions/federated-user-relationship.exception';
import { FEDERATED_MODULE_USER_MODEL_SERVICE_TOKEN } from '../federated.constants';

describe('FederatedOAuthService', () => {
  let service: FederatedOAuthService;
  let userModelService: jest.Mocked<FederatedUserModelServiceInterface>;
  let federatedService: jest.Mocked<FederatedService>;
  let federatedModelService: jest.Mocked<FederatedModelService>;

  const mockUser: FederatedCredentialsInterface = {
    id: 'user-id',
    email: 'test@example.com',
    username: 'testuser',
  };

  const mockFederated: FederatedEntityInterface = {
    id: 'federated-id',
    provider: 'google',
    subject: 'subject-id',
    user: { id: 'user-id' },
    dateCreated: new Date(),
    dateUpdated: new Date(),
    dateDeleted: null,
    version: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FederatedOAuthService,
        {
          provide: FEDERATED_MODULE_USER_MODEL_SERVICE_TOKEN,
          useValue: {
            byId: jest.fn(),
            byEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: FederatedService,
          useValue: {
            exists: jest.fn(),
          },
        },
        {
          provide: FederatedModelService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FederatedOAuthService>(FederatedOAuthService);
    userModelService = module.get(FEDERATED_MODULE_USER_MODEL_SERVICE_TOKEN);
    federatedService = module.get(FederatedService);
    federatedModelService = module.get(FederatedModelService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sign', () => {
    it('should return existing user when federated exists', async () => {
      // Arrange
      jest.spyOn(federatedService, 'exists').mockResolvedValue(mockFederated);
      jest.spyOn(userModelService, 'byId').mockResolvedValue(mockUser);

      // Act
      const result = await service.sign(
        'google',
        'test@example.com',
        'subject-id',
      );

      // Assert
      expect(result).toBe(mockUser);
      expect(federatedService.exists).toHaveBeenCalledWith(
        'google',
        'subject-id',
      );
      expect(userModelService.byId).toHaveBeenCalledWith('user-id');
    });

    it('should create new user and federated when they do not exist', async () => {
      // Arrange
      jest.spyOn(federatedService, 'exists').mockResolvedValue(null);
      jest.spyOn(userModelService, 'byEmail').mockResolvedValue(null);
      jest.spyOn(userModelService, 'create').mockResolvedValue(mockUser);
      jest
        .spyOn(federatedModelService, 'create')
        .mockResolvedValue(mockFederated);

      // Act
      const result = await service.sign(
        'google',
        'test@example.com',
        'subject-id',
      );

      // Assert
      expect(result).toBe(mockUser);
      expect(federatedService.exists).toHaveBeenCalledWith(
        'google',
        'subject-id',
      );
      expect(userModelService.byEmail).toHaveBeenCalledWith('test@example.com');
      expect(userModelService.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'test@example.com',
      });
      expect(federatedModelService.create).toHaveBeenCalledWith({
        provider: 'google',
        subject: 'subject-id',
        user: mockUser,
      });
    });

    it('should use existing user when email exists but federated does not', async () => {
      // Arrange
      jest.spyOn(federatedService, 'exists').mockResolvedValue(null);
      jest.spyOn(userModelService, 'byEmail').mockResolvedValue(mockUser);
      jest
        .spyOn(federatedModelService, 'create')
        .mockResolvedValue(mockFederated);

      // Act
      const result = await service.sign(
        'google',
        'test@example.com',
        'subject-id',
      );

      // Assert
      expect(result).toBe(mockUser);
      expect(federatedService.exists).toHaveBeenCalledWith(
        'google',
        'subject-id',
      );
      expect(userModelService.byEmail).toHaveBeenCalledWith('test@example.com');
      expect(userModelService.create).not.toHaveBeenCalled();
      expect(federatedModelService.create).toHaveBeenCalledWith({
        provider: 'google',
        subject: 'subject-id',
        user: mockUser,
      });
    });

    it('should throw FederatedUserRelationshipException when federated exists but has no user', async () => {
      // Arrange
      const federatedWithoutUser = {
        ...mockFederated,
        user: { id: null } as unknown as { id: string },
      };
      jest
        .spyOn(federatedService, 'exists')
        .mockResolvedValue(federatedWithoutUser);

      // Act & Assert
      await expect(
        service.sign('google', 'test@example.com', 'subject-id'),
      ).rejects.toThrow(FederatedUserRelationshipException);
    });

    it('should throw FederatedFindUserException when user is not found', async () => {
      // Arrange
      jest.spyOn(federatedService, 'exists').mockResolvedValue(mockFederated);
      jest.spyOn(userModelService, 'byId').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.sign('google', 'test@example.com', 'subject-id'),
      ).rejects.toThrow(FederatedFindUserException);
    });

    it('should throw FederatedCreateUserException when user creation fails', async () => {
      // Arrange
      jest.spyOn(federatedService, 'exists').mockResolvedValue(null);
      jest.spyOn(userModelService, 'byEmail').mockResolvedValue(null);
      jest
        .spyOn(userModelService, 'create')
        .mockRejectedValue(new Error('Failed to create user'));

      // Act & Assert
      await expect(
        service.sign('google', 'test@example.com', 'subject-id'),
      ).rejects.toThrow(FederatedCreateUserException);
    });

    it('should throw ModelMutateException when federated creation fails', async () => {
      // Arrange
      jest.spyOn(federatedService, 'exists').mockResolvedValue(null);
      jest.spyOn(userModelService, 'byEmail').mockResolvedValue(mockUser);
      jest
        .spyOn(federatedModelService, 'create')
        .mockRejectedValue(new Error('Failed to create federated'));

      // Act & Assert
      await expect(
        service.sign('google', 'test@example.com', 'subject-id'),
      ).rejects.toThrow(
        'Error while trying to mutate a FederatedOAuthService model',
      );
    });
  });
});
