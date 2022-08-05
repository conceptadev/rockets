import { Module } from '@nestjs/common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '@concepta/nestjs-crud';
import { UserModule } from '../user.module';
import { ormConfig } from './ormconfig.fixture';
import { UserEntityFixture } from './user.entity.fixture';
import { InvitationSignupEventAsync } from './events/invitation-created.event';
import { EventModule } from '@concepta/nestjs-event';

@Module({
  imports: [
    TypeOrmExtModule.register(ormConfig),
    CrudModule.register(),
    EventModule.register(),
    UserModule.register({
      settings: {
        invitationSignupEvent: InvitationSignupEventAsync,
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
