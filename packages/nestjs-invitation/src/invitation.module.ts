import { DynamicModule, Module } from '@nestjs/common';

import {
  InvitationAsyncOptions,
  InvitationModuleClass,
  InvitationOptions,
} from './invitation.module-definition';

import { InvitationService } from './services/invitation.service';
import { InvitationCrudService } from './services/invitation-crud.service';
import { InvitationAcceptanceService } from './services/invitation-acceptance.service';
import { InvitationSendService } from './services/invitation-send.service';
import { InvitationRevocationService } from './services/invitation-revocation.service';
import { InvitationController } from './controllers/invitation.controller';
import { InvitationAcceptanceController } from './controllers/invitation-acceptance.controller';

/**
 * Invitation module
 */
@Module({
  providers: [
    InvitationService,
    InvitationCrudService,
    InvitationAcceptanceService,
    InvitationSendService,
    InvitationRevocationService,
  ],
  controllers: [InvitationController, InvitationAcceptanceController],
  exports: [InvitationService],
})
export class InvitationModule extends InvitationModuleClass {
  static register(options: InvitationOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: InvitationAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: InvitationOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: InvitationAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }
}
