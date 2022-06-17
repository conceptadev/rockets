import { CrudModule } from '@concepta/nestjs-crud';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { useSeeders } from '@jorgebodega/typeorm-seeding';
import { Test, TestingModule } from '@nestjs/testing';
import { OtpModule } from '../otp.module';
import { OtpService } from './otp.service';

import { UserEntityFixture } from '../__fixtures__/entities/user-entity.fixture';
import { UserOtpEntityFixture } from '../__fixtures__/entities/user-otp-entity.fixture';
import { UserOtpRepositoryFixture } from '../__fixtures__/repositories/user-otp-repository.fixture';
import { UserFactoryFixture } from '../__fixtures__/factories/user.factory.fixture';
import { UserOtpFactoryFixture } from '../__fixtures__/factories/user-otp.factory.fixture';
import ms from 'ms';

describe('OtpModule', () => {
  const RANDOM_UUID_PASSCODE = 'RANDOM_UUID_PASSCODE';
  const RANDOM_UUID_PASSCODE_EXPIRED = 'RANDOM_UUID_PASSCODE_EXPIRED';
  const CATEGORY_RESTE_PASSWORD = 'reset-password';

  let testModule: TestingModule;
  let otpModule: OtpModule;
  let otpService: OtpService;
  let testUser: UserEntityFixture;
  let connectionNumber = 1;

  beforeEach(async () => {
    const connectionName = `test_${connectionNumber++}`;

    testModule = await Test.createTestingModule({
      imports: [
        TypeOrmExtModule.register({
          name: connectionName,
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          entities: [UserEntityFixture, UserOtpEntityFixture],
        }),
        OtpModule.register({
          entities: {
            userOtp: {
              entity: UserOtpEntityFixture,
              repository: UserOtpRepositoryFixture,
              connection: connectionName,
            },
          },
        }),
        CrudModule.register(),
      ],
    }).compile();

    await useSeeders([], {
      root: __dirname,
      connection: connectionName,
    });

    // Create user
    const userFactory = new UserFactoryFixture();
    testUser = await userFactory.create();
    const now = new Date();
    const expirationDate = new Date(now.getTime() + ms('1d'));
    console.log('expirationDate ', expirationDate);
    // Create passcode otp for a user
    const userOtpFactory = new UserOtpFactoryFixture();
    await userOtpFactory.create({
      category: CATEGORY_RESTE_PASSWORD,
      type: 'uuid',
      passCode: RANDOM_UUID_PASSCODE,
      expirationDate: expirationDate,
      assignee: testUser,
    });

    otpModule = testModule.get<OtpModule>(OtpModule);
    otpService = testModule.get<OtpService>(OtpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    testModule.close();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(otpModule).toBeInstanceOf(OtpModule);
    });
    it('should be have expected services', async () => {
      expect(otpService).toBeInstanceOf(OtpService);
    });
  });

  describe('otpService isValid', () => {
    it('check if is valid true', async () => {
      const isValid: Partial<boolean> = await otpService.isValid(
        'userOtp',
        testUser,
        CATEGORY_RESTE_PASSWORD,
        RANDOM_UUID_PASSCODE,
      );

      expect(isValid).toBeTruthy();
    });

    it('check if is valid after delete', async () => {
      let isValid: boolean = await otpService.isValid(
        'userOtp',
        testUser,
        CATEGORY_RESTE_PASSWORD,
        RANDOM_UUID_PASSCODE,
        true,
      );

      expect(isValid).toBeTruthy();

      isValid = await otpService.isValid(
        'userOtp',
        testUser,
        CATEGORY_RESTE_PASSWORD,
        RANDOM_UUID_PASSCODE,
      );

      expect(isValid).toBeFalsy();

      isValid = await otpService.isValid(
        'userOtp',
        testUser,
        CATEGORY_RESTE_PASSWORD,
        RANDOM_UUID_PASSCODE,
        true,
      );

      expect(isValid).toBeFalsy();
    });

    it('check if is expired', async () => {
      const now = new Date();
      const expirationDate = new Date(now.getTime() - ms('1d'));

      // Create passcode otp for a user
      const userOtpFactory = new UserOtpFactoryFixture();
      await userOtpFactory.create({
        category: CATEGORY_RESTE_PASSWORD,
        type: 'uuid',
        passCode: RANDOM_UUID_PASSCODE_EXPIRED,
        expirationDate: expirationDate,
        assignee: testUser,
      });

      const isValid: boolean = await otpService.isValid(
        'userOtp',
        testUser,
        CATEGORY_RESTE_PASSWORD,
        RANDOM_UUID_PASSCODE_EXPIRED,
      );

      expect(isValid).toBeFalsy();
    });
  });
});
