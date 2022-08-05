import { Module } from '@nestjs/common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';

import { AuditModuleCustomFixture } from './audit.module.custom.fixture';
import { ormConfig } from './ormconfig.fixture';

@Module({
  imports: [TypeOrmExtModule.register(ormConfig), AuditModuleCustomFixture],
})
export class AppModuleCustomFixture {}
