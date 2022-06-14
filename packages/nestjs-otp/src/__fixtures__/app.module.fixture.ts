import { CrudModule } from '@concepta/nestjs-crud';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { Module } from '@nestjs/common';

import { OtpModule } from '../otp.module';
import { UserEntityFixture } from './entities/user-entity.fixture';
import { UserOtpEntityFixture } from './entities/user-otp-entity.fixture';

import { UserOtpRepositoryFixture } from './repositories/user-otp-repository.fixture';

@Module({
  imports: [
    TypeOrmExtModule.registerAsync({
      useFactory: async () => ({
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        entities: [UserEntityFixture, UserOtpEntityFixture],
      }),
    }),
    OtpModule.register({
      entities: {
        userOtp: {
          entity: UserOtpEntityFixture,
          repository: UserOtpRepositoryFixture,
        },
      },
    }),
    CrudModule.register(),
  ],
})
export class AppModuleFixture {}
