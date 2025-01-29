import { AuthenticatedEventInterface } from '@concepta/nestjs-common';
import {
  EventAsyncInterface,
  EventListenerOn,
  EventListenService,
} from '@concepta/nestjs-event';
import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { UserSettingsInterface } from '../interfaces/user-settings.interface';
import { UserLookupService } from '../services/user-lookup.service';
import { UserMutateService } from '../services/user-mutate.service';
import { USER_MODULE_SETTINGS_TOKEN } from '../user.constants';

@Injectable()
export class AuthenticatedListener
  extends EventListenerOn<
    EventAsyncInterface<AuthenticatedEventInterface, boolean>
  >
  implements OnModuleInit
{
  constructor(
    @Inject(USER_MODULE_SETTINGS_TOKEN)
    private settings: UserSettingsInterface,
    private userLookupService: UserLookupService,
    private userMutateService: UserMutateService,
    @Optional()
    @Inject(EventListenService)
    private eventListenService?: EventListenService,
  ) {
    super();
  }

  onModuleInit() {
    if (this.eventListenService && this.settings.authenticatedEvent) {
      this.eventListenService?.on(this.settings.authenticatedEvent, this);
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
      if (payload.userInfo.success) {
        // update last login and login attempts to zero
        await this.userMutateService.update(
          {
            id: payload.userInfo.userId,
            lastLogin: new Date(),
            loginAttempts: 0,
          },
          payload.queryOptions,
        );
      } else {
        // get current user
        const user = await this.userLookupService.byId(payload.userInfo.userId);
        if (user) {
          // increment login attempts
          await this.userMutateService.update(
            {
              id: user.id,
              loginAttempts: user.loginAttempts + 1,
            },
            payload.queryOptions,
          );
        }
      }
    } catch (err) {
      Logger.error(err);
      return false;
    }
    return true;
  }
}
