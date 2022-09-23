import { Module } from '@nestjs/common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '@concepta/nestjs-crud';
import { EventModule } from '@concepta/nestjs-event';

import { UserModule } from '../user.module';
import { ormConfig } from './ormconfig.fixture';
import { UserEntityFixture } from './user.entity.fixture';
import { InvitationAcceptedEventAsync } from './events/invitation-accepted.event';
import { InvitationGetOrCreateUserRequestEventAsync } from './events/invitation-get-or-create-user-request.event';

@Module({
  imports: [
    TypeOrmExtModule.forRoot(ormConfig),
    CrudModule.forRoot({}),
    EventModule.forRoot({}),
    UserModule.forRoot({
      settings: {
        invitationRequestEvent: InvitationAcceptedEventAsync,
        invitationGetOrCreateUserRequestEvent:
          InvitationGetOrCreateUserRequestEventAsync,
      },
      entities: {
        user: {
          entity: UserEntityFixture,
        },
      },
    }),
  ],
})
export class AppModuleFixture {}
