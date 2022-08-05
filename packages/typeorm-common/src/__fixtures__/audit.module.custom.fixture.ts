import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { Module } from '@nestjs/common';
import { AuditEntityFixture } from './audit.entity.fixture';
import { AuditLookupCustomService } from './services/audit-lookup.custom.service';
import { AuditMutateCustomService } from './services/audit-mutate.custom.service';

@Module({
  imports: [
    TypeOrmExtModule.forFeature({
      audit: {
        entity: AuditEntityFixture,
      },
    }),
  ],
  providers: [AuditLookupCustomService, AuditMutateCustomService],
  exports: [AuditLookupCustomService, AuditMutateCustomService],
})
export class AuditModuleCustomFixture {}
