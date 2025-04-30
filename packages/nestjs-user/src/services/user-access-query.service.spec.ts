import { Test, TestingModule } from '@nestjs/testing';
import { UserAccessQueryService } from './user-access-query.service';
import { AccessControlContext } from '@concepta/nestjs-access-control';
import { UserDto } from '../dto/user.dto';
import { UserPasswordDto } from '../dto/user-password.dto';
import { UserResource } from '../user.types';
import { ActionEnum } from '@concepta/nestjs-access-control';

describe(UserAccessQueryService.name, () => {
  let service: UserAccessQueryService;
  let context: jest.Mocked<AccessControlContext>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserAccessQueryService],
    }).compile();

    service = module.get<UserAccessQueryService>(UserAccessQueryService);
    context = {
      getQuery: jest.fn(),
      getUser: jest.fn(),
      getRequest: jest.fn(),
    } as unknown as jest.Mocked<AccessControlContext>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe(UserAccessQueryService.prototype.canAccess.name, () => {
    it('should delegate to canUpdatePassword method', async () => {
      // Arrange
      const expectedResult = true;
      const mockCanUpdatePassword = jest.fn().mockResolvedValueOnce(expectedResult);
      jest
        .spyOn(service.constructor.prototype, 'canUpdatePassword')
        .mockImplementationOnce(mockCanUpdatePassword);

      // Act
      const result = await service.canAccess(context);

      // Assert
      expect(result).toBe(expectedResult);
      expect(mockCanUpdatePassword).toHaveBeenCalledWith(context);
    });
  });

  describe('canUpdatePassword', () => {
    it('should return true when resource is not UserResource.One or action is not UPDATE', async () => {
      // Arrange
      jest.spyOn(context, 'getQuery').mockReturnValueOnce({
        resource: 'other-resource',
        action: ActionEnum.CREATE,
      });

      // Act
      const result = await service.canAccess(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when user IDs match and password is provided', async () => {
      // Arrange
      const userId = '123';
      const userAuthorizedDto = { id: userId } as UserDto;
      const userParamDto = { id: userId } as UserDto;
      const userPasswordDto = { password: 'new-password' } as UserPasswordDto;

      jest.spyOn(context, 'getQuery').mockReturnValueOnce({
        resource: UserResource.One,
        action: ActionEnum.UPDATE,
      });
      jest.spyOn(context, 'getUser').mockReturnValueOnce(userAuthorizedDto);
      jest.spyOn(context, 'getRequest').mockImplementationOnce((property?: string) => {
        if (property === 'params') return userParamDto;
        if (property === 'body') return userPasswordDto;
        return null;
      });

      // Act
      const result = await service.canAccess(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when user IDs do not match', async () => {
      // Arrange
      const userAuthorizedDto = { id: '123' };
      const userParamDto = { id: '456' };
      const userPasswordDto = { password: 'new-password' };

      jest.spyOn(context, 'getQuery').mockReturnValueOnce({
        resource: UserResource.One,
        action: ActionEnum.UPDATE,
      });
      jest.spyOn(context, 'getUser').mockReturnValueOnce(userAuthorizedDto);
      jest.spyOn(context, 'getRequest').mockImplementation((property?: string) => {
        if (property === 'params') return userParamDto;
        if (property === 'body') return userPasswordDto;
        return null;
      });

      // Act
      const result = await service.canAccess(context);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when password is not provided', async () => {
      // Arrange
      const userId = '123';
      const userAuthorizedDto = { id: userId } as UserDto;
      const userParamDto = { id: userId } as UserDto;
      const userPasswordDto = {} as UserPasswordDto;

      jest.spyOn(context, 'getQuery').mockReturnValueOnce({
        resource: UserResource.One,
        action: ActionEnum.UPDATE,
      });
      jest.spyOn(context, 'getUser').mockReturnValueOnce(userAuthorizedDto);
      jest.spyOn(context, 'getRequest').mockImplementationOnce((property?: string) => {
        if (property === 'params') return userParamDto;
        if (property === 'body') return userPasswordDto;
        return null;
      });

      // Act
      const result = await service.canAccess(context);

      // Assert
      expect(result).toBe(true);
    });
  });
});
