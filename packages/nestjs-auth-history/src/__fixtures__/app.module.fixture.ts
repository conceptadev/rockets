import { AccessControlModule } from '@concepta/nestjs-access-control';
import { CrudModule } from '@concepta/nestjs-crud';
import { EventModule } from '@concepta/nestjs-event';
import { AuthLocalAuthenticatedEventAsync } from '@concepta/nestjs-auth-local';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { Module } from '@nestjs/common';
import { AccessControl } from 'accesscontrol';

import { AuthHistoryModule } from '../auth-history.module';
import { AuthHistoryResource } from '../auth-history.types';

import { AuthHistoryAccessQueryService } from '../services/auth-history-query.service';
import { AuthHistoryEntityFixture } from './entities/auth-history.entity.fixture';
import { ormConfig } from './ormconfig.fixture';

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
    AccessControlModule.forRoot({
      settings: { rules },
      queryServices: [AuthHistoryAccessQueryService],
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
