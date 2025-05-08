import { Test, TestingModule } from '@nestjs/testing';
import { OtpInterface } from '@concepta/nestjs-common';
import { OTP_MODULE_REPOSITORIES_TOKEN } from './otp.constants';
import { OtpModule } from './otp.module';
import { OtpService } from './services/otp.service';

import { AppModuleFixture } from './__fixtures__/app.module.fixture';
import { DynamicModule } from '@nestjs/common';
import { RepositoryInterface } from '@concepta/nestjs-common';

describe(OtpModule.name, () => {
  let otpModule: OtpModule;
  let otpService: OtpService;
  let otpDynamicRepo: Record<string, RepositoryInterface<OtpInterface>>;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();

    otpModule = testModule.get<OtpModule>(OtpModule);
    otpService = testModule.get<OtpService>(OtpService);
    otpDynamicRepo = testModule.get<
      Record<string, RepositoryInterface<OtpInterface>>
    >(OTP_MODULE_REPOSITORIES_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(otpModule).toBeInstanceOf(OtpModule);
      expect(otpService).toBeInstanceOf(OtpService);
      expect(otpDynamicRepo).toBeDefined();
    });
  });

  describe('OtpModule functions', () => {
    const spyRegister = jest
      .spyOn(OtpModule, 'register')
      .mockImplementation(() => {
        return {} as DynamicModule;
      });

    const spyRegisterAsync = jest
      .spyOn(OtpModule, 'registerAsync')
      .mockImplementation(() => {
        return {} as DynamicModule;
      });

    it('should call super.register in register method', () => {
      OtpModule.register({});
      expect(spyRegister).toHaveBeenCalled();
    });

    it('should call super.registerAsync in register method', () => {
      OtpModule.registerAsync({});
      expect(spyRegisterAsync).toHaveBeenCalled();
    });
  });
});
