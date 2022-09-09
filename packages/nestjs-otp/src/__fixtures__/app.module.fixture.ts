import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { Module } from '@nestjs/common';

import { OtpModule } from '../otp.module';
import { UserEntityFixture } from './entities/user-entity.fixture';
import { UserOtpEntityFixture } from './entities/user-otp-entity.fixture';

@Module({
  imports: [
    TypeOrmExtModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      entities: [UserEntityFixture, UserOtpEntityFixture],
    }),
    OtpModule.register({
      entities: {
        userOtp: {
          entity: UserOtpEntityFixture,
        },
      },
    }),
  ],
})
export class AppModuleFixture {}
