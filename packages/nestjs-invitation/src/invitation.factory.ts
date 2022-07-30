import { randomUUID } from 'crypto';
import Faker from '@faker-js/faker';
import { Factory } from '@concepta/typeorm-seeding';
import { InvitationEntityInterface } from './interfaces/invitation.entity.interface';

export class InvitationFactory extends Factory<InvitationEntityInterface> {
  protected async entity(
    invitation: InvitationEntityInterface,
  ): Promise<InvitationEntityInterface> {
    invitation.code = randomUUID();
    invitation.email = Faker.internet.email();
    invitation.category = Faker.name.title();

    return invitation;
  }
}
