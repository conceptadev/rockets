import { CrudModule } from '@concepta/nestjs-crud';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { Module } from '@nestjs/common';

import { OtpModule } from '../otp.module';
import { UserEntityFixture } from './entities/user-entity.fixture';
import { UserOtpEntityFixture } from './entities/user-otp-entity.fixture';

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
        },
      },
    }),
    CrudModule.register(),
  ],
})
export class AppModuleFixture {}
