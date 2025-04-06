import { AuthVerifyController } from './auth-verify.controller';
import { AuthVerifyService } from './services/auth-verify.service';
import { AuthVerifyUpdateDto } from './dto/auth-verify-update.dto';
import { mock } from 'jest-mock-extended';
import { AuthVerifyDto } from './dto/auth-verify.dto';

describe(AuthVerifyController.name, () => {
  let controller: AuthVerifyController;
  let authVerifyService: AuthVerifyService;
  const dto: AuthVerifyDto = {
    email: 'test@example.com',
  };
  const authVerifyUpdateDto: AuthVerifyUpdateDto = {
    passcode: '123456',
  };
  beforeEach(() => {
    authVerifyService = mock<AuthVerifyService>();
    controller = new AuthVerifyController(authVerifyService);
  });

  describe('send', () => {
    it('should call send method of AuthVerifyService', async () => {
      const verifySendSpy = jest.spyOn(authVerifyService, 'send');

      await controller.send(dto);

      expect(verifySendSpy).toHaveBeenCalledWith({ email: dto.email });
    });
  });

  describe('confirm', () => {
    it('should call confirmUser method of AuthVerifyService', async () => {
      const confirmUserSpy = jest
        .spyOn(authVerifyService, 'confirmUser')
        .mockResolvedValue(null);

      await controller.confirm(authVerifyUpdateDto);

      expect(confirmUserSpy).toHaveBeenCalledWith({
        passcode: authVerifyUpdateDto.passcode,
      });
    });

    it('should call confirmUser method of AuthVerifyService', async () => {
      const confirmUserSpy = jest
        .spyOn(authVerifyService, 'confirmUser')
        .mockResolvedValue({
          id: '1',
        });

      await controller.confirm(authVerifyUpdateDto);

      expect(confirmUserSpy).toHaveBeenCalledWith({
        passcode: authVerifyUpdateDto.passcode,
      });
    });
  });
});
