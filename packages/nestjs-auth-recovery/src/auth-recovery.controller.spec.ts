import { AuthRecoveryController } from './auth-recovery.controller';
import { AuthRecoveryService } from './services/auth-recovery.service';
import { AuthRecoveryRecoverLoginDto } from './dto/auth-recovery-recover-login.dto';
import { AuthRecoveryUpdatePasswordDto } from './dto/auth-recovery-update-password.dto';
import { mock } from 'jest-mock-extended';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthRecoveryController', () => {
  let controller: AuthRecoveryController;
  let authRecoveryService: AuthRecoveryService;
  const dto: AuthRecoveryRecoverLoginDto = {
    email: 'test@example.com',
  };
  const passwordDto: AuthRecoveryUpdatePasswordDto = {
    passcode: '123456',
    newPassword: 'newPassword',
  };
  beforeEach(() => {
    authRecoveryService = mock<AuthRecoveryService>();
    controller = new AuthRecoveryController(authRecoveryService);
  });

  describe('recoverLogin', () => {
    it('should call recoverLogin method of AuthRecoveryService', async () => {
      const recoverLoginSpy = jest.spyOn(authRecoveryService, 'recoverLogin');

      await controller.recoverLogin(dto);

      expect(recoverLoginSpy).toHaveBeenCalledWith(dto.email);
    });
  });

  describe('recoverPassword', () => {
    it('should call recoverPassword method of AuthRecoveryService', async () => {
      const recoverPasswordSpy = jest.spyOn(
        authRecoveryService,
        'recoverPassword',
      );

      await controller.recoverPassword(dto);

      expect(recoverPasswordSpy).toHaveBeenCalledWith(dto.email);
    });
  });

  describe('validatePasscode', () => {
    it('should call validatePasscode method of AuthRecoveryService', async () => {
      const validatePasscodeSpy = jest
        .spyOn(authRecoveryService, 'validatePasscode')
        .mockResolvedValue(null);

      const t = () => controller.validatePasscode(passwordDto.passcode);
      await expect(t).rejects.toThrow(NotFoundException);

      expect(validatePasscodeSpy).toHaveBeenCalledWith(passwordDto.passcode);
    });

    it('should call validatePasscode method of AuthRecoveryService', async () => {
      const validatePasscodeSpy = jest
        .spyOn(authRecoveryService, 'validatePasscode')
        .mockResolvedValue({
          assignee: {
            id: '1',
          },
        });

      await controller.validatePasscode(passwordDto.passcode);

      expect(validatePasscodeSpy).toHaveBeenCalledWith(passwordDto.passcode);
    });
  });

  describe('updatePassword', () => {
    it('should call updatePassword method of AuthRecoveryService', async () => {
      const updatePasswordSpy = jest
        .spyOn(authRecoveryService, 'updatePassword')
        .mockResolvedValue(null);

      const t = () => controller.updatePassword(passwordDto);
      await expect(t).rejects.toThrow(BadRequestException);

      expect(updatePasswordSpy).toHaveBeenCalledWith(
        passwordDto.passcode,
        passwordDto.newPassword,
      );
    });

    it('should call updatePassword method of AuthRecoveryService', async () => {
      const updatePasswordSpy = jest
        .spyOn(authRecoveryService, 'updatePassword')
        .mockResolvedValue({
          id: '1',
        });

      await controller.updatePassword(passwordDto);

      expect(updatePasswordSpy).toHaveBeenCalledWith(
        passwordDto.passcode,
        passwordDto.newPassword,
      );
    });
  });
});
