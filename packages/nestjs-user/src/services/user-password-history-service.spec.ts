import { Test, TestingModule } from '@nestjs/testing';
import { UserPasswordHistoryService } from './user-password-history.service';
import { UserPasswordHistoryModelService } from './user-password-history-model.service';
import { UserException } from '../exceptions/user-exception';
import {
  ReferenceId,
  PasswordStorageInterface,
  UserPasswordHistoryEntityInterface,
} from '@concepta/nestjs-common';
import { USER_MODULE_SETTINGS_TOKEN } from '../user.constants';
import { UserSettingsInterface } from '../interfaces/user-settings.interface';

describe(UserPasswordHistoryService.name, () => {
  let service: UserPasswordHistoryService;
  let userPasswordHistoryModelService: jest.Mocked<UserPasswordHistoryModelService>;
  let userSettings: UserSettingsInterface;

  const mockUserId: ReferenceId = 'test-user-id';
  const mockPasswordStore: PasswordStorageInterface = {
    passwordHash: 'hashed-password',
    passwordSalt: 'salt',
  };

  const mockHistoryItem: UserPasswordHistoryEntityInterface = {
    id: 'test-id',
    userId: mockUserId,
    passwordHash: mockPasswordStore.passwordHash,
    passwordSalt: mockPasswordStore.passwordSalt,
    dateCreated: new Date(),
    dateUpdated: new Date(),
    dateDeleted: null,
    version: 1,
  };

  beforeEach(async () => {
    userSettings = {
      passwordHistory: {
        limitDays: undefined,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPasswordHistoryService,
        {
          provide: USER_MODULE_SETTINGS_TOKEN,
          useValue: userSettings,
        },
        {
          provide: UserPasswordHistoryModelService,
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            gt: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserPasswordHistoryService>(
      UserPasswordHistoryService,
    );
    userPasswordHistoryModelService = module.get(
      UserPasswordHistoryModelService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe(UserPasswordHistoryService.prototype.pushHistory.name, () => {
    it('should successfully push password history', async () => {
      // Arrange
      userPasswordHistoryModelService.create.mockResolvedValue(mockHistoryItem);

      // Act
      await service.pushHistory(mockUserId, mockPasswordStore);

      // Assert
      expect(userPasswordHistoryModelService.create).toHaveBeenCalledWith({
        userId: mockUserId,
        ...mockPasswordStore,
      });
    });

    it('should throw UserException when model service create fails', async () => {
      // Arrange
      const error = new Error('Database error');
      userPasswordHistoryModelService.create.mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.pushHistory(mockUserId, mockPasswordStore),
      ).rejects.toThrow(UserException);
      expect(userPasswordHistoryModelService.create).toHaveBeenCalledWith({
        userId: mockUserId,
        ...mockPasswordStore,
      });
    });
  });

  describe(UserPasswordHistoryService.prototype.getHistory.name, () => {
    it('should successfully get password history', async () => {
      // Arrange
      const mockHistory = [mockHistoryItem];
      userPasswordHistoryModelService.find.mockResolvedValue(mockHistory);

      // Act
      const result = await service.getHistory(mockUserId);

      // Assert
      expect(result).toEqual(mockHistory);
      expect(userPasswordHistoryModelService.find).toHaveBeenCalled();
    });

    it('should return empty array when no history found', async () => {
      // Arrange
      userPasswordHistoryModelService.find.mockResolvedValue([]);

      // Act
      const result = await service.getHistory(mockUserId);

      // Assert
      expect(result).toEqual([]);
      expect(userPasswordHistoryModelService.find).toHaveBeenCalled();
    });

    it('should throw UserException when model service find fails', async () => {
      // Arrange
      const error = new Error('Database error');
      userPasswordHistoryModelService.find.mockRejectedValue(error);

      // Act & Assert
      await expect(service.getHistory(mockUserId)).rejects.toThrow(
        UserException,
      );
      expect(userPasswordHistoryModelService.find).toHaveBeenCalled();
    });
  });

  describe(
    UserPasswordHistoryService.prototype['getHistoryFindManyOptions'].name,
    () => {
      it('should return basic query options when no limitDays setting', () => {
        // Arrange
        userSettings.passwordHistory = {};

        // Act
        const result = service['getHistoryFindManyOptions'](mockUserId);

        // Assert
        expect(result).toEqual({
          where: {
            userId: mockUserId,
          },
          order: {
            dateCreated: 'ASC',
          },
        });
      });
    },
  );
});
