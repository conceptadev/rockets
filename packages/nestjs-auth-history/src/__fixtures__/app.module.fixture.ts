import { AccessControlModule } from '@concepta/nestjs-access-control';
import {
  AuthLocalAuthenticatedEventAsync,
  AuthLocalModule,
} from '@concepta/nestjs-auth-local';
import { CrudModule } from '@concepta/nestjs-crud';
import { EventModule } from '@concepta/nestjs-event';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { Module } from '@nestjs/common';
import { AccessControl } from 'accesscontrol';

import { AuthHistoryModule } from '../auth-history.module';
import { AuthHistoryResource } from '../auth-history.types';

import { AuthenticationModule } from '@concepta/nestjs-authentication';
import { JwtModule } from '@concepta/nestjs-jwt';
import { AuthHistoryAccessQueryService } from '../services/auth-history-query.service';
import { AuthHistoryEntityFixture } from './entities/auth-history.entity.fixture';
import { ormConfig } from './ormconfig.fixture';
import { UserLookupServiceFixture } from './services/user-lookup.service.fixture';
import { ValidateUserServiceFixture } from './services/validate-user.service.fixture';

const rules = new AccessControl();
rules
  .grant('auth-history')
  .resource(AuthHistoryResource.One)
  .createOwn()
  .readOwn()
  .updateOwn()
  .deleteOwn();

@Module({
  imports: [
    TypeOrmExtModule.forRoot(ormConfig),
    CrudModule.forRoot({}),
    EventModule.forRoot({}),
    JwtModule.forRoot({}),
    AuthenticationModule.forRoot({}),
    AccessControlModule.forRoot({
      settings: { rules },
      queryServices: [AuthHistoryAccessQueryService],
    }),
    AuthLocalModule.forRootAsync({
      useFactory: () => ({
        userLookupService: new UserLookupServiceFixture(),
        validateUserService: new ValidateUserServiceFixture(),
      }),
    }),
    AuthHistoryModule.forRoot({
      settings: {
        authenticatedEvents: [AuthLocalAuthenticatedEventAsync],
      },
      entities: {
        authHistory: {
          entity: AuthHistoryEntityFixture,
        },
      },
    }),
  ],
})
export class AppModuleFixture {}
