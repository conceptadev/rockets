import { EventAsyncInterface, EventListenerOn } from '@concepta/nestjs-event';
import { InvitationSignupEventPayloadInterface } from '@concepta/ts-common';
import { UserMutateService } from '../services/user-mutate.service';
import { Repository } from 'typeorm';
import { UserEntityInterface } from '../interfaces/user-entity.interface';

export class CreateUserListener extends EventListenerOn<
  EventAsyncInterface<[InvitationSignupEventPayloadInterface]>
> {
  constructor(
    private repo: Repository<UserEntityInterface>,
    private userMutateService: UserMutateService,
  ) {
    super();
  }

  async listen(
    event: EventAsyncInterface<[InvitationSignupEventPayloadInterface]>,
  ) {
    const firstValue = event.values[0];
    if (!firstValue) {
      // return [
      //   {
      //     error: new Error('No event data'),
      //     processed: true,
      //     successfully: false,
      //   },
      // ];
      throw new Error('No event data');
    }
    const { userId, newPassword } = firstValue?.payload ?? {};
    if (!userId || !newPassword) {
      throw new Error('Invalid payload');
    }
    const user = await this.repo.findOneBy({ id: userId as string });
    if (!user) {
      throw new Error('User not found');
    }
    await this.userMutateService.save({ ...user, password: newPassword });

    event.values[0] = { ...firstValue, processed: true, successfully: true };

    return event.values;
  }
}
