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
import { OtpDto } from '../dto/otp.dto';
import { OtpTypeNotDefinedException } from '../exceptions/otp-type-not-defined.exception';

describe('OtpModule', () => {
  const RANDOM_UUID_PASSCODE = 'RANDOM_UUID_PASSCODE';
  const RANDOM_UUID_PASSCODE_EXPIRED = 'RANDOM_UUID_PASSCODE_EXPIRED';
  const CATEGORY_DEFAULT = 'CATEGORY_DEFAULT';

  let testModule: TestingModule;
  let otpModule: OtpModule;
  let otpService: OtpService;
  let testUser: UserEntityFixture;
  let connectionNumber = 1;

  const defaultCreateOtp = async () =>
    await otpService.create('userOtp', {
      assignee: testUser,
      type: 'uuid',
      category: CATEGORY_DEFAULT,
    });

  // try to delete
  const defaultDeleteOtp = async (passcode = '') =>
    await otpService.delete('userOtp', testUser, CATEGORY_DEFAULT, passcode);

  const defaultIsValidOtp = async (passcode = '', deleteAfterValid = false) =>
    await otpService.isValid(
      'userOtp',
      testUser,
      CATEGORY_DEFAULT,
      passcode,
      deleteAfterValid,
    );

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

    // Create passcode otp for a user
    const userOtpFactory = new UserOtpFactoryFixture();
    await userOtpFactory.create({
      category: CATEGORY_DEFAULT,
      type: 'uuid',
      passcode: RANDOM_UUID_PASSCODE,
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
      const isValid: Partial<boolean> = await defaultIsValidOtp(
        RANDOM_UUID_PASSCODE,
      );

      expect(isValid).toBe(true);
    });

    it('check if is valid after delete', async () => {
      let isValid: Partial<boolean> = await defaultIsValidOtp(
        RANDOM_UUID_PASSCODE,
        true,
      );

      expect(isValid).toBeTruthy();

      isValid = await await defaultIsValidOtp(RANDOM_UUID_PASSCODE);

      expect(isValid).toBe(false);

      isValid = await defaultIsValidOtp(RANDOM_UUID_PASSCODE, true);

      expect(isValid).toBe(false);
    });

    it('check if is expired', async () => {
      const now = new Date();
      const expirationDate = new Date(now.getTime() - ms('1d'));

      // Create passcode otp for a user
      const userOtpFactory = new UserOtpFactoryFixture();
      await userOtpFactory.create({
        category: CATEGORY_DEFAULT,
        type: 'uuid',
        passcode: RANDOM_UUID_PASSCODE_EXPIRED,
        expirationDate: expirationDate,
        assignee: testUser,
      });

      const isValid: boolean = await defaultIsValidOtp(
        RANDOM_UUID_PASSCODE_EXPIRED,
        true,
      );

      expect(isValid).toBe(false);
    });
  });

  describe('otpService create', () => {
    it('create with success', async () => {
      const otpDto: Partial<OtpDto> = await defaultCreateOtp();

      const isValid: boolean = await defaultIsValidOtp(otpDto.passcode);

      expect(isValid).toBe(true);
    });

    it('create with fail', async () => {
      const otpDto: Partial<OtpDto> = await defaultCreateOtp();

      expect(otpDto).toBeTruthy();

      const isValid: boolean = await defaultIsValidOtp('fail');

      expect(isValid).toBe(false);
    });

    it('create with fail 2', async () => {
      try {
        await otpService.create('userOtp', {
          assignee: testUser,
          type: 'wrongType',
          category: CATEGORY_DEFAULT,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(OtpTypeNotDefinedException);
      }
    });
  });

  describe('otpService delete', () => {
    it('create with success', async () => {
      const otpDto: Partial<OtpDto> = await defaultCreateOtp();

      // was it created?
      expect(otpDto).toBeTruthy();

      // try to delete
      await defaultDeleteOtp(otpDto.passcode);

      // check if deleted is valid
      const isValid: boolean = await defaultIsValidOtp(otpDto.passcode);

      expect(isValid).toBe(false);
    });
  });

  describe('otpService clear', () => {
    it('clear with success', async () => {
      const otpDto: Partial<OtpDto> = await defaultCreateOtp();

      let isValid: boolean = await defaultIsValidOtp(otpDto.passcode);
      expect(otpDto).toBeTruthy();
      expect(isValid).toBe(true);

      const otpDto2: Partial<OtpDto> = await defaultCreateOtp();

      isValid = await defaultIsValidOtp(otpDto2.passcode);
      expect(otpDto2).toBeTruthy();

      // try to delete
      await otpService.clear('userOtp', testUser, CATEGORY_DEFAULT);

      // check if deleted is valid
      isValid = await defaultIsValidOtp(otpDto.passcode);
      expect(isValid).toBe(false);

      isValid = await defaultIsValidOtp(otpDto2.passcode);
      expect(isValid).toBe(false);
    });
  });
});
