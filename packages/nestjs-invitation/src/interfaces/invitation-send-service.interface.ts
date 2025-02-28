import { InvitationInterface } from '@concepta/nestjs-common';
import { InvitationGetUserEventResponseInterface } from '@concepta/nestjs-common/src';
import { QueryOptionsInterface } from '@concepta/typeorm-common';
import { InvitationCreatableInterface } from './invitation-creatable.interface';

export interface InvitationSendServiceInterface {
  /**
   * Create a new invitation
   *
   * @param createDto - The invitation creation data
   * @param queryOptions - Optional query options for the transaction
   * @returns Promise resolving to the created invitation with id and user
   */
  create(
    createDto: InvitationCreatableInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<Required<Pick<InvitationInterface, 'id' | 'user'>>>;

  /**
   * Send an invitation to a user
   *
   * @param invitation - The invitation details including category, user, email and code
   * @param queryOptions - Optional query options for the transaction
   */
  send(
    invitation: Pick<
      InvitationInterface,
      'category' | 'user' | 'email' | 'code'
    >,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void>;

  /**
   * Get user details for an invitation
   *
   * @param options - The user lookup options including email and optional constraints
   * @param queryOptions - Optional query options for the transaction
   * @returns Promise resolving to the user details response
   */
  getUser(
    options: Pick<InvitationInterface, 'email'> &
      Partial<Pick<InvitationInterface, 'constraints'>>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<InvitationGetUserEventResponseInterface>;
}
