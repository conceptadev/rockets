import { AccessControl } from 'accesscontrol';
import { Module } from '@nestjs/common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { AuthenticationModule } from '@concepta/nestjs-authentication';
import { AccessControlModule } from '@concepta/nestjs-access-control';
import { JwtModule } from '@concepta/nestjs-jwt';
import { AuthJwtModule } from '@concepta/nestjs-auth-jwt';
import { PasswordModule } from '@concepta/nestjs-password';
import { CrudModule } from '@concepta/nestjs-crud';
import { EventModule } from '@concepta/nestjs-event';

import { UserModule } from '../user.module';
import { UserResource } from '../user.types';
import { InvitationAcceptedEventAsync } from './events/invitation-accepted.event';
import { InvitationGetUserEventAsync } from './events/invitation-get-user.event';
import { UserLookupService } from '../services/user-lookup.service';
import { UserAccessQueryService } from '../services/user-access-query.service';

import { ormConfig } from './ormconfig.fixture';
import { UserEntityFixture } from './user.entity.fixture';
import { UserPasswordHistoryEntityFixture } from './user-password-history.entity.fixture';

const rules = new AccessControl();
rules
  .grant('user')
  .resource(UserResource.One)
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
    AuthJwtModule.forRootAsync({
      inject: [UserLookupService],
      useFactory: (userLookupService: UserLookupService) => ({
        userLookupService,
      }),
    }),
    AuthenticationModule.forRoot({}),
    PasswordModule.forRoot({}),
    AccessControlModule.forRoot({
      settings: { rules },
      queryServices: [UserAccessQueryService],
    }),
    UserModule.forRoot({
      settings: {
        invitationRequestEvent: InvitationAcceptedEventAsync,
        invitationGetUserEvent: InvitationGetUserEventAsync,
        passwordHistory: {
          enabled: true,
          limitDays: 99,
        },
      },
      entities: {
        user: {
          entity: UserEntityFixture,
        },
        'user-password-history': {
          entity: UserPasswordHistoryEntityFixture,
        },
      },
    }),
  ],
})
export class AppModuleFixture {}
