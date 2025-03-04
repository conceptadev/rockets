import { AuthenticatedEventInterface } from '@concepta/nestjs-common';
import { EventAsyncInterface, EventListenerOn } from '@concepta/nestjs-event';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AUTH_HISTORY_MODULE_SETTINGS_TOKEN } from '../auth-history.constants';
import { AuthHistoryMutateServiceInterface } from '../interfaces/auth-history-mutate-service.interface';
import { AuthHistorySettingsInterface } from '../interfaces/auth-history-settings.interface';
import { AuthHistoryMutateService } from '../services/auth-history-mutate.service';

@Injectable()
export class AuthenticatedListener
  extends EventListenerOn<
    EventAsyncInterface<AuthenticatedEventInterface, boolean>
  >
  implements OnModuleInit
{
  constructor(
    @Inject(AUTH_HISTORY_MODULE_SETTINGS_TOKEN)
    private settings: AuthHistorySettingsInterface,
    @Inject(AuthHistoryMutateService)
    private authHistoryMutateService: AuthHistoryMutateServiceInterface,
  ) {
    super();
  }

  onModuleInit() {
    if (this.settings.authenticatedEvents) {
      this.settings.authenticatedEvents.forEach((event) => {
        this.on(event);
      });
    }
  }

  async listen(
    event: EventAsyncInterface<AuthenticatedEventInterface, boolean>,
  ) {
    const { payload } = event;

    if (!payload.userInfo) {
      Logger.error('Auth History event data payload is missing.');
      return false;
    }
    try {
      await this.authHistoryMutateService.create(
        payload.userInfo,
        payload.queryOptions,
      );
    } catch (err) {
      Logger.error(err);
      return false;
    }
    return true;
  }
}
