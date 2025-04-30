import { Test, TestingModule } from '@nestjs/testing';
import { UserPasswordService } from './user-password.service';
import { UserModelService } from './user-model.service';
import { PasswordCreationService } from '@concepta/nestjs-password';
import { PasswordStorageService } from '@concepta/nestjs-password';
import { UserPasswordHistoryService } from './user-password-history.service';
import { UserException } from '../exceptions/user-exception';
import { UserNotFoundException } from '../exceptions/user-not-found-exception';
import { ReferenceId, PasswordStorageInterface } from '@concepta/nestjs-common';

describe(UserPasswordService.name, () => {
  let service: UserPasswordService;
  let userModelService: jest.Mocked<UserModelService>;
  let passwordCreationService: jest.Mocked<PasswordCreationService>;
  let passwordStorageService: jest.Mocked<PasswordStorageService>;
  let userPasswordHistoryService: jest.Mocked<UserPasswordHistoryService>;

  // Common mock data
  const mockUserId: ReferenceId = 'test-user-id';
  const mockPasswordStore: PasswordStorageInterface = {
    passwordHash: 'hashed-password',
    passwordSalt: 'salt',
  };

  const createMockUser = (overrides = {}) => ({
    id: mockUserId,
    email: 'test@example.com',
    username: 'testuser',
    active: true,
    dateCreated: new Date(),
    dateUpdated: new Date(),
    dateDeleted: null,
    version: 1,
    ...mockPasswordStore,
    ...overrides,
  });

  const createMockHashedPassword = (overrides = {}) => ({
    passwordHash: 'hashed-new-password',
    passwordSalt: 'new-salt',
    ...overrides,
  });

  const createMockHistoryItem = (overrides = {}) => ({
    id: 'history-id',
    ...mockPasswordStore,
    ...overrides,
  });

  const createMockAuthorizedUser = (overrides = {}) => ({
    id: mockUserId,
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPasswordService,
        {
          provide: UserModelService,
          useValue: {
            byId: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: PasswordCreationService,
          useValue: {
            validateCurrent: jest.fn(),
            validateHistory: jest.fn(),
          },
        },
        {
          provide: PasswordStorageService,
          useValue: {
            hash: jest.fn(),
          },
        },
        {
          provide: UserPasswordHistoryService,
          useValue: {
            pushHistory: jest.fn(),
            getHistory: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserPasswordService>(UserPasswordService);
    userModelService = module.get(UserModelService);
    passwordCreationService = module.get(PasswordCreationService);
    passwordStorageService = module.get(PasswordStorageService);
    userPasswordHistoryService = module.get(UserPasswordHistoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe(UserPasswordService.prototype.setPassword.name, () => {
    it('should set a new password for a user', async () => {
      // Arrange
      const mockPassword = 'new-password';
      const mockHashedPassword = createMockHashedPassword();
      const mockUser = createMockUser();

      // Mock the service methods
      userModelService.byId.mockResolvedValue(mockUser);
      passwordStorageService.hash.mockResolvedValue(mockHashedPassword);
      passwordCreationService.validateCurrent.mockResolvedValue(true);
      passwordCreationService.validateHistory.mockResolvedValue(true);

      // Act
      await service.setPassword({ password: mockPassword }, mockUserId);

      // Assert
      expect(userModelService.byId).toHaveBeenCalledWith(mockUserId);
      expect(passwordStorageService.hash).toHaveBeenCalledWith(mockPassword);
      expect(userModelService.update).toHaveBeenCalledWith({
        id: mockUserId,
        passwordHash: mockHashedPassword.passwordHash,
        passwordSalt: mockHashedPassword.passwordSalt,
      });
      expect(userPasswordHistoryService.pushHistory).toHaveBeenCalledWith(
        mockUserId,
        mockHashedPassword,
      );
    });

    it('should validate current password when user is updating their own password', async () => {
      // Arrange
      const mockCurrentPassword = 'current-password';
      const mockTargetUser = createMockUser();
      const mockAuthorizedUser = createMockAuthorizedUser();

      // Mock the service method
      passwordCreationService.validateCurrent.mockResolvedValue(true);

      // Act
      const result = await service['validateCurrent'](
        mockTargetUser,
        mockCurrentPassword,
        mockAuthorizedUser,
      );

      // Assert
      expect(result).toBe(true);
      expect(passwordCreationService.validateCurrent).toHaveBeenCalledWith({
        password: mockCurrentPassword,
        target: mockTargetUser,
      });
    });

    it('should validate password history', async () => {
      // Arrange
      const mockPassword = 'new-password';
      const mockHashedPassword = createMockHashedPassword();
      const mockUser = createMockUser();
      const mockHistory = [createMockHistoryItem()];

      // Mock the service methods
      userModelService.byId.mockResolvedValue(mockUser);
      passwordStorageService.hash.mockResolvedValue(mockHashedPassword);
      passwordCreationService.validateCurrent.mockResolvedValue(true);
      passwordCreationService.validateHistory.mockResolvedValue(true);
      userPasswordHistoryService.getHistory.mockResolvedValue(mockHistory);

      // Act
      await service.setPassword({ password: mockPassword }, mockUserId);

      // Assert
      expect(userPasswordHistoryService.getHistory).toHaveBeenCalledWith(
        mockUserId,
      );
      expect(passwordCreationService.validateHistory).toHaveBeenCalledWith({
        password: mockPassword,
        targets: mockHistory,
      });
    });

    it('should push password to history after update', async () => {
      // Arrange
      const mockPassword = 'new-password';
      const mockHashedPassword = createMockHashedPassword();
      const mockUser = createMockUser();

      // Mock the service methods
      userModelService.byId.mockResolvedValue(mockUser);
      passwordStorageService.hash.mockResolvedValue(mockHashedPassword);
      passwordCreationService.validateCurrent.mockResolvedValue(true);
      passwordCreationService.validateHistory.mockResolvedValue(true);

      // Act
      await service.setPassword({ password: mockPassword }, mockUserId);

      // Assert
      expect(userPasswordHistoryService.pushHistory).toHaveBeenCalledWith(
        mockUserId,
        mockHashedPassword,
      );
    });

    it('should throw exception when validation fails', async () => {
      // Arrange
      const mockPassword = 'new-password';
      const mockCurrentPassword = 'current-password';
      const mockUser = createMockUser();
      const mockAuthorizedUser = createMockAuthorizedUser();

      // Mock the service methods
      userModelService.byId.mockResolvedValue(mockUser);
      passwordCreationService.validateCurrent.mockResolvedValue(false);

      // Act & Assert
      await expect(
        service.setPassword(
          { password: mockPassword, passwordCurrent: mockCurrentPassword },
          mockUserId,
          mockAuthorizedUser,
        ),
      ).rejects.toThrow(UserException);
    });
  });

  describe(UserPasswordService.prototype.getPasswordStore.name, () => {
    it('should return user with password store when user exists', async () => {
      // Arrange
      const mockUser = createMockUser();

      // Mock the service method
      userModelService.byId.mockResolvedValue(mockUser);

      // Act
      const result = await service.getPasswordStore(mockUserId);

      // Assert
      expect(userModelService.byId).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual({
        ...mockUser,
        passwordHash: mockPasswordStore.passwordHash,
        passwordSalt: mockPasswordStore.passwordSalt,
      });
    });

    it('should throw UserNotFoundException when user does not exist', async () => {
      // Arrange
      userModelService.byId.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getPasswordStore(mockUserId)).rejects.toThrow(
        UserNotFoundException,
      );
      expect(userModelService.byId).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw UserException when database error occurs', async () => {
      // Arrange
      const mockError = new Error('Database error');
      userModelService.byId.mockRejectedValue(mockError);

      // Act & Assert
      await expect(service.getPasswordStore(mockUserId)).rejects.toThrow(
        UserException,
      );
      expect(userModelService.byId).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe(UserPasswordService.prototype['validateCurrent'].name, () => {
    it('should return true when user is not updating their own password', async () => {
      // Arrange
      const mockTargetUser = createMockUser({ id: 'target-user-id' });
      const mockAuthorizedUser = createMockAuthorizedUser({
        id: 'different-user-id',
      });

      // Act
      const result = await service['validateCurrent'](
        mockTargetUser,
        'some-password',
        mockAuthorizedUser,
      );

      // Assert
      expect(result).toBe(true);
      expect(passwordCreationService.validateCurrent).not.toHaveBeenCalled();
    });

    it('should validate current password when user is updating their own password', async () => {
      // Arrange
      const mockTargetUser = createMockUser();
      const mockAuthorizedUser = createMockAuthorizedUser();
      const mockCurrentPassword = 'current-password';

      // Mock the service method
      passwordCreationService.validateCurrent.mockResolvedValue(true);

      // Act
      const result = await service['validateCurrent'](
        mockTargetUser,
        mockCurrentPassword,
        mockAuthorizedUser,
      );

      // Assert
      expect(result).toBe(true);
      expect(passwordCreationService.validateCurrent).toHaveBeenCalledWith({
        password: mockCurrentPassword,
        target: mockTargetUser,
      });
    });

    it('should throw exception when current password is invalid', async () => {
      // Arrange
      const mockTargetUser = createMockUser();
      const mockAuthorizedUser = createMockAuthorizedUser();
      const mockCurrentPassword = 'invalid-password';

      // Mock the service method
      passwordCreationService.validateCurrent.mockResolvedValue(false);

      // Act & Assert
      await expect(
        service['validateCurrent'](
          mockTargetUser,
          mockCurrentPassword,
          mockAuthorizedUser,
        ),
      ).rejects.toThrow(UserException);
      expect(passwordCreationService.validateCurrent).toHaveBeenCalledWith({
        password: mockCurrentPassword,
        target: mockTargetUser,
      });
    });
  });

  describe(UserPasswordService.prototype['validateHistory'].name, () => {
    it('should validate password against history when history service exists', async () => {
      // Arrange
      const mockUser = createMockUser();
      const mockPassword = 'new-password';
      const mockHistory = [createMockHistoryItem()];

      // Mock the service methods
      userPasswordHistoryService.getHistory.mockResolvedValue(mockHistory);
      passwordCreationService.validateHistory.mockResolvedValue(true);

      // Act
      const result = await service['validateHistory'](mockUser, mockPassword);

      // Assert
      expect(userPasswordHistoryService.getHistory).toHaveBeenCalledWith(
        mockUserId,
      );
      expect(passwordCreationService.validateHistory).toHaveBeenCalledWith({
        password: mockPassword,
        targets: mockHistory,
      });
      expect(result).toBe(true);
    });

    it('should throw exception when password has been used recently', async () => {
      // Arrange
      const mockUser = createMockUser();
      const mockPassword = 'recently-used-password';
      const mockHistory = [createMockHistoryItem()];

      // Mock the service methods
      userPasswordHistoryService.getHistory.mockResolvedValue(mockHistory);
      passwordCreationService.validateHistory.mockResolvedValue(false);

      // Act & Assert
      await expect(
        service['validateHistory'](mockUser, mockPassword),
      ).rejects.toThrow(UserException);
      expect(userPasswordHistoryService.getHistory).toHaveBeenCalledWith(
        mockUserId,
      );
      expect(passwordCreationService.validateHistory).toHaveBeenCalledWith({
        password: mockPassword,
        targets: mockHistory,
      });
    });

    it('should return true when history service does not exist', async () => {
      // Arrange
      const mockUser = createMockUser();
      const mockPassword = 'new-password';

      // Create a new instance of the service without the history service
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UserPasswordService,
          {
            provide: UserModelService,
            useValue: {
              byId: jest.fn(),
              update: jest.fn(),
            },
          },
          {
            provide: PasswordCreationService,
            useValue: {
              validateCurrent: jest.fn(),
              validateHistory: jest.fn(),
            },
          },
          {
            provide: PasswordStorageService,
            useValue: {
              hash: jest.fn(),
            },
          },
        ],
      }).compile();

      const serviceWithoutHistory =
        module.get<UserPasswordService>(UserPasswordService);

      // Act
      const result = await serviceWithoutHistory['validateHistory'](
        mockUser,
        mockPassword,
      );

      // Assert
      expect(result).toBe(true);
      expect(passwordCreationService.validateHistory).not.toHaveBeenCalled();
    });
  });
});
