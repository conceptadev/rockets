import { CrudModule } from '@concepta/nestjs-crud';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { useSeeders } from '@jorgebodega/typeorm-seeding';
import { Test, TestingModule } from '@nestjs/testing';
import { OtpModule } from '../otp.module';
import { OtpService } from './otp.service';

import { UserEntityFixture } from '../__fixtures__/entities/user-entity.fixture';
import { UserOtpEntityFixture } from '../__fixtures__/entities/user-otp-entity.fixture';
import { UserOtpRepositoryFixture } from '../__fixtures__/repositories/user-otp-repository.fixture';

import { ReferenceLookupException } from '@concepta/typeorm-common';

describe('OtpModule', () => {
  let testModule: TestingModule;
  let otpModule: OtpModule;
  let otpService: OtpService;

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

    // const userFactory = new UserFactoryFixture();
    //testUser = await userFactory.create();

    // const userOtpFactory = new UserOtpFactoryFixture();
    // await userOtpFactory.create({
    //   otp: testOtp1,
    //   assignee: testUser,
    // });

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

  describe('throwLookupException', () => {
    it('should throw reference lookup exception', async () => {
      const e = new Error('Fake error');

      const t = () => {
        otpService['throwLookupException'](e, 'MyEntityName');
      };

      expect(t).toThrow(ReferenceLookupException);
    });

    it('should re-throw unknown error', async () => {
      const t = () => {
        otpService['throwLookupException']('wut', 'MyEntityName');
      };

      expect(t).toThrow('wut');
    });
  });
});
