import { AuthVerifyController } from './auth-verify.controller';
import { AuthVerifyService } from './services/auth-verify.service';
import { AuthVerifyUpdateDto } from './dto/auth-verify-update.dto';
import { mock } from 'jest-mock-extended';
import { AuthVerifyDto } from './dto/auth-verify.dto';
import { AuthRecoveryOtpInvalidException } from './exceptions/auth-verify-otp-invalid.exception';

describe(AuthVerifyController.name, () => {
  let controller: AuthVerifyController;
  let authVerifyService: AuthVerifyService;
  const dto: AuthVerifyDto = {
    email: 'test@example.com',
  };
  const passwordDto: AuthVerifyUpdateDto = {
    passcode: '123456',
  };
  beforeEach(() => {
    authVerifyService = mock<AuthVerifyService>();
    controller = new AuthVerifyController(authVerifyService);
  });

  describe('send', () => {
    it('should call send method of AuthVerifyService', async () => {
      const verifyPasswordSpy = jest.spyOn(authVerifyService, 'send');

      await controller.send(dto);

      expect(verifyPasswordSpy).toHaveBeenCalledWith(dto.email);
    });
  });

  describe('updatePassword', () => {
    it('should call updatePassword method of AuthVerifyService', async () => {
      const updatePasswordSpy = jest
        .spyOn(authVerifyService, 'confirmUser')
        .mockResolvedValue(null);

      const t = () => controller.confirm(passwordDto);
      await expect(t).rejects.toThrow(AuthRecoveryOtpInvalidException);

      expect(updatePasswordSpy).toHaveBeenCalledWith(passwordDto.passcode);
    });

    it('should call updatePassword method of AuthVerifyService', async () => {
      const updatePasswordSpy = jest
        .spyOn(authVerifyService, 'confirmUser')
        .mockResolvedValue({
          id: '1',
        });

      await controller.confirm(passwordDto);

      expect(updatePasswordSpy).toHaveBeenCalledWith(passwordDto.passcode);
    });
  });
});
