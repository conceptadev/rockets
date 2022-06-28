import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { OtpInterface } from '@concepta/ts-common';
import { OTP_MODULE_REPOSITORIES_TOKEN } from './otp.constants';
import { OtpModule } from './otp.module';
import { OtpService } from './services/otp.service';

import { AppModuleFixture } from './__fixtures__/app.module.fixture';

describe('OtpModule', () => {
  let otpModule: OtpModule;
  let otpService: OtpService;
  let otpDynamicRepo: Record<string, Repository<OtpInterface>>;
  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();

    otpModule = testModule.get<OtpModule>(OtpModule);
    otpService = testModule.get<OtpService>(OtpService);
    otpDynamicRepo = testModule.get<Record<string, Repository<OtpInterface>>>(
      OTP_MODULE_REPOSITORIES_TOKEN,
    );
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
});
