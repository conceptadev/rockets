import { InvitationUserInterface } from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';
import { InvitationCreateInviteInterface } from './invitation-create-invite.interface';
import { InvitationSendInvitationEmailOptionsInterface } from './invitation-send-invitation-email-options.interface';
import { InvitationSendInviteInterface } from './invitation-send-invite.interface';

export interface InvitationSendServiceInterface {
  /**
   * Create a new invitation
   *
   * @param createInviteDto - The invitation creation data
   * @param queryOptions - Optional query options for the transaction
   * @returns Promise resolving to the created invitation with id and user
   */
  create(
    createInviteDto: InvitationCreateInviteInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<InvitationSendInviteInterface>;

  /**
   * Send an invitation to a user
   *
   * @param invitation - The invitation details including category, user, email and code
   * @param queryOptions - Optional query options for the transaction
   */
  send(
    invitation: InvitationSendInviteInterface,
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
    options: Pick<InvitationCreateInviteInterface, 'email' | 'constraints'>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<InvitationUserInterface>;

  /**
   * Send an invitation email
   *
   * @param options - The email options containing recipient email, invitation code,
   *                 passcode and expiration
   * @returns Promise resolving when email is sent
   */
  sendInvitationEmail(
    options: InvitationSendInvitationEmailOptionsInterface,
  ): Promise<void>;
}
