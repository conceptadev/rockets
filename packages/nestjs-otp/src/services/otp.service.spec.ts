import ms from 'ms';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { OtpInterface } from '@concepta/nestjs-common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { SeedingSource } from '@concepta/typeorm-seeding';
import { OtpModule } from '../otp.module';
import { OtpService } from './otp.service';
import { OtpTypeNotDefinedException } from '../exceptions/otp-type-not-defined.exception';

import { UserEntityFixture } from '../__fixtures__/entities/user-entity.fixture';
import { UserOtpEntityFixture } from '../__fixtures__/entities/user-otp-entity.fixture';
import { UserFactoryFixture } from '../__fixtures__/factories/user.factory.fixture';
import { UserOtpFactoryFixture } from '../__fixtures__/factories/user-otp.factory.fixture';
import { OTP_MODULE_REPOSITORIES_TOKEN } from '../otp.constants';
import { OtpLimitReachedException } from '../exceptions/otp-limit-reached.exception';
import { RepositoryInterface } from '@concepta/typeorm-common';

describe('OtpModule', () => {
  const CATEGORY_DEFAULT = 'CATEGORY_DEFAULT';

  let testModule: TestingModule;
  let seedingSource: SeedingSource;
  let otpModule: OtpModule;
  let otpService: OtpService;
  let repository: RepositoryInterface<OtpInterface>;
  let connectionNumber = 1;
  let userFactory: UserFactoryFixture;
  let userOtpFactory: UserOtpFactoryFixture;

  const factoryCreateUser = async () => {
    return userFactory.create();
  };

  const factoryCreateOtp = async (
    overrides: Partial<OtpInterface> & Pick<OtpInterface, 'assignee'>,
  ) => {
    const now = new Date();
    const expirationDate = new Date(now.getTime() + ms('1d'));

    return userOtpFactory.create({
      category: CATEGORY_DEFAULT,
      expirationDate: expirationDate,
      ...overrides,
    });
  };

  const defaultCreateOtp = async (
    options: Pick<OtpInterface, 'assignee'> &
      Partial<Pick<OtpInterface, 'type'>>,
    clearOnCreate?: boolean,
    rateSeconds?: number,
    rateThreshold?: number,
  ) =>
    await otpService.create({
      assignment: 'userOtp',
      otp: {
        type: 'uuid',
        expiresIn: '1h',
        category: CATEGORY_DEFAULT,
        ...options,
      },
      queryOptions: {},
      clearOnCreate,
      rateSeconds,
      rateThreshold,
    });

  // try to delete
  const defaultDeleteOtp = async (
    otp: Pick<OtpInterface, 'assignee' | 'passcode' | 'category'>,
  ) => await otpService.delete('userOtp', otp);

  const defaultIsValidOtp = async (
    otp: Pick<OtpInterface, 'passcode' | 'category'>,
    deleteIfValid?: boolean,
  ) => await otpService.validate('userOtp', otp, deleteIfValid);

  beforeEach(async () => {
    // process.env.OTP_CLEAR_ON_CREATE = 'true';
    // process.env.OTP_RATE_SECONDS = '10';
    // process.env.OTP_RATE_THRESHOLD = '2';
    await initModule();
  });

  const initModule = async () => {
    const connectionName = `test_${connectionNumber++}`;
    testModule = await Test.createTestingModule({
      imports: [
        TypeOrmExtModule.forRoot({
          name: connectionName,
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          entities: [UserEntityFixture, UserOtpEntityFixture],
          logger: 'simple-console',
        }),
        OtpModule.register({
          entities: {
            userOtp: {
              entity: UserOtpEntityFixture,
              dataSource: connectionName,
            },
          },
        }),
      ],
    }).compile();

    seedingSource = new SeedingSource({
      dataSource: testModule.get(getDataSourceToken(connectionName)),
    });

    await seedingSource.initialize();

    userFactory = new UserFactoryFixture({ seedingSource });
    userOtpFactory = new UserOtpFactoryFixture({ seedingSource });

    otpModule = testModule.get<OtpModule>(OtpModule);
    otpService = testModule.get<OtpService>(OtpService);
    const allRepo = testModule.get<
      Record<string, RepositoryInterface<OtpInterface>>
    >(OTP_MODULE_REPOSITORIES_TOKEN);
    repository = allRepo.userOtp;
  };

  afterEach(() => {
    process.env.OTP_CLEAR_ON_CREATE = undefined;
    process.env.OTP_RATE_SECONDS = undefined;
    process.env.OTP_RATE_THRESHOLD = undefined;
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
      const assignee = await factoryCreateUser();
      const otp = await factoryCreateOtp({ assignee });
      expect((await defaultIsValidOtp(otp))?.assignee.id).toBe(otp.assignee.id);
    });

    it('check if is valid after delete', async () => {
      const assignee = await factoryCreateUser();
      const otp = await factoryCreateOtp({ assignee });
      expect((await defaultIsValidOtp(otp, true))?.assignee.id).toBe(
        otp.assignee.id,
      );
      expect(await defaultIsValidOtp(otp)).toBeNull();
      expect(await defaultIsValidOtp(otp, true)).toBeNull();
    });

    it('check if is expired', async () => {
      const now = new Date();
      const expirationDate = new Date(now.getTime() - ms('1d'));

      const assignee = await factoryCreateUser();

      const otp = await factoryCreateOtp({
        expirationDate: expirationDate,
        assignee,
      });

      expect(await defaultIsValidOtp(otp)).toBeNull();
    });
  });

  describe('otpService create', () => {
    it('create with success', async () => {
      const assignee = await factoryCreateUser();
      const otp = await defaultCreateOtp({ assignee });

      expect(otp.category).toBe(CATEGORY_DEFAULT);
      expect(otp.type).toBe('uuid');
      expect(typeof otp.passcode).toBe('string');
      expect(otp.passcode.length).toBeGreaterThan(0);
      expect(otp.expirationDate).toBeInstanceOf(Date);
      expect(otp.assignee.id).toBeTruthy();
    });

    it('create with success and check previous otp invalid', async () => {
      const assignee = await factoryCreateUser();
      const otp = await defaultCreateOtp({ assignee });
      const otp_2 = await defaultCreateOtp({ assignee }, true);

      // make sure previous was deleted
      expect(await defaultIsValidOtp(otp)).toBeNull();
      // check new one
      expect((await defaultIsValidOtp(otp_2, true))?.assignee.id).toBe(
        otp.assignee.id,
      );
    });

    it('create with success and check previous otp valid', async () => {
      const assignee = await factoryCreateUser();
      const otp = await defaultCreateOtp({ assignee });
      const otp_2 = await defaultCreateOtp({ assignee }, false);

      // make sure previous was deleted
      expect((await defaultIsValidOtp(otp, true))?.assignee.id).toBe(
        otp.assignee.id,
      );
      expect(await defaultIsValidOtp(otp)).toBeNull();
      // check new one
      expect((await defaultIsValidOtp(otp_2, true))?.assignee.id).toBe(
        otp.assignee.id,
      );
    });

    it('create with success and check previous otp invalid after transaction error', async () => {
      const assignee = await factoryCreateUser();
      const otp = await defaultCreateOtp({ assignee });

      jest.spyOn(repository, 'save').mockImplementationOnce(() => {
        throw new Error('Error on save');
      });
      // spy on with error
      try {
        await defaultCreateOtp({ assignee });
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }

      // validate first one created,
      expect((await defaultIsValidOtp(otp, true))?.assignee.id).toBe(
        otp.assignee.id,
      );
    });

    it('create with fail', async () => {
      const assignee = await factoryCreateUser();
      const otp = await defaultCreateOtp({ assignee });

      expect(otp).toBeTruthy();
      expect(
        await defaultIsValidOtp({ ...otp, passcode: 'INVALID' }),
      ).toBeNull();
    });

    it('create with fail 2', async () => {
      try {
        const assignee = await factoryCreateUser();
        await defaultCreateOtp({ assignee, type: 'wrongType' });
      } catch (e) {
        expect(e).toBeInstanceOf(OtpTypeNotDefinedException);
      }
    });

    describe('create with limit ', () => {
      it('create with fail limit', async () => {
        process.env.OTP_CLEAR_ON_CREATE = 'true';
        process.env.OTP_RATE_SECONDS = '10';
        process.env.OTP_RATE_THRESHOLD = '2';
        await initModule();
        const assignee = await factoryCreateUser();
        await defaultCreateOtp({ assignee });
        await defaultCreateOtp({ assignee });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        try {
          await defaultCreateOtp({ assignee });
          fail('Expected OtpLimitReachedException to be thrown');
        } catch (e) {
          expect(e).toBeInstanceOf(OtpLimitReachedException);
        }
      });

      it('create with fail limit 2', async () => {
        process.env.OTP_CLEAR_ON_CREATE = 'true';
        process.env.OTP_RATE_SECONDS = '10';
        process.env.OTP_RATE_THRESHOLD = '3';
        await initModule();
        const assignee = await factoryCreateUser();
        await defaultCreateOtp({ assignee });
        await defaultCreateOtp({ assignee });
        await defaultCreateOtp({ assignee });
        try {
          await defaultCreateOtp({ assignee });
          fail('Expected OtpLimitReachedException to be thrown');
        } catch (e) {
          expect(e).toBeInstanceOf(OtpLimitReachedException);
        }
      });

      it('create with success limit using override', async () => {
        process.env.OTP_CLEAR_ON_CREATE = 'true';
        process.env.OTP_RATE_SECONDS = `10`;
        process.env.OTP_RATE_THRESHOLD = '5';
        const clearOnCreate = false;
        const rateSeconds = 10;
        const rateThreshold = 3;
        await initModule();
        const assignee = await factoryCreateUser();
        await defaultCreateOtp(
          { assignee },
          clearOnCreate,
          rateSeconds,
          rateThreshold,
        );
        await defaultCreateOtp(
          { assignee },
          clearOnCreate,
          rateSeconds,
          rateThreshold,
        );
        await defaultCreateOtp(
          { assignee },
          clearOnCreate,
          rateSeconds,
          rateThreshold,
        );
        try {
          await defaultCreateOtp(
            { assignee },
            clearOnCreate,
            rateSeconds,
            rateThreshold,
          );
          fail('Expected OtpLimitReachedException to be thrown');
        } catch (e) {
          expect(e).toBeInstanceOf(OtpLimitReachedException);
        }
      });

      it('create with success limit', async () => {
        process.env.OTP_CLEAR_ON_CREATE = 'true';
        process.env.OTP_RATE_SECONDS = '10';
        process.env.OTP_RATE_THRESHOLD = '4';
        await initModule();
        const assignee = await factoryCreateUser();
        await defaultCreateOtp({ assignee });
        await defaultCreateOtp({ assignee });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const otp = await defaultCreateOtp({ assignee });

        expect(otp.category).toBe(CATEGORY_DEFAULT);
        expect(otp.type).toBe('uuid');
        expect(typeof otp.passcode).toBe('string');
        expect(otp.passcode.length).toBeGreaterThan(0);
        expect(otp.expirationDate).toBeInstanceOf(Date);
        expect(otp.assignee.id).toBeTruthy();
      });

      it('create with success with limit 2', async () => {
        process.env.OTP_CLEAR_ON_CREATE = 'true';
        process.env.OTP_RATE_SECONDS = '1';
        process.env.OTP_RATE_THRESHOLD = '4';
        await initModule();
        const assignee = await factoryCreateUser();
        await defaultCreateOtp({ assignee });
        await defaultCreateOtp({ assignee });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const otp = await defaultCreateOtp({ assignee });

        expect(otp.category).toBe(CATEGORY_DEFAULT);
        expect(otp.type).toBe('uuid');
        expect(typeof otp.passcode).toBe('string');
        expect(otp.passcode.length).toBeGreaterThan(0);
        expect(otp.expirationDate).toBeInstanceOf(Date);
        expect(otp.assignee.id).toBeTruthy();
      });
    });
  });

  describe('otpService delete', () => {
    it('delete with success', async () => {
      const assignee = await factoryCreateUser();
      const otp = await defaultCreateOtp({ assignee });
      expect(otp).toBeTruthy();

      // try to delete
      expect(await defaultDeleteOtp(otp)).toBeUndefined();

      // check if deleted is valid
      expect(await defaultIsValidOtp(otp)).toBeNull();
    });
  });

  describe('otpService clear', () => {
    it('clear with success', async () => {
      const assignee = await factoryCreateUser();
      const otp = await defaultCreateOtp({ assignee });

      expect(otp).toBeTruthy();
      expect((await defaultIsValidOtp(otp))?.assignee.id).toBe(otp.assignee.id);

      const otp2 = await defaultCreateOtp({ assignee });
      expect(otp2).toBeTruthy();
      expect((await defaultIsValidOtp(otp2))?.assignee.id).toBe(
        otp2.assignee.id,
      );

      // try to clear
      expect(await otpService.clear('userOtp', otp)).toBeUndefined();

      // cleared passcodes should be invalid
      // TODO: check that they were actually removed from database
      expect(await defaultIsValidOtp(otp)).toBeNull;
      expect(await defaultIsValidOtp(otp2)).toBeNull();
    });
  });
});
