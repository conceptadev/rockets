import { InvitationUserInterface } from '@concepta/nestjs-common';
import { InvitationCreateInviteInterface } from '../domain/invitation-create-invite.interface';
import { InvitationSendInvitationEmailOptionsInterface } from '../options/invitation-send-invitation-email-options.interface';
import { InvitationSendInviteInterface } from '../domain/invitation-send-invite.interface';

export interface InvitationSendServiceInterface {
  /**
   * Create a new invitation
   *
   * @param createInviteDto - The invitation creation data
   * @returns Promise resolving to the created invitation with id and user
   */
  create(
    createInviteDto: InvitationCreateInviteInterface,
  ): Promise<InvitationSendInviteInterface>;

  /**
   * Send an invitation to a user
   *
   * @param invitation - The invitation details including category, user, email and code
   */
  send(invitation: InvitationSendInviteInterface): Promise<void>;

  /**
   * Get user details for an invitation
   *
   * @param options - The user find options including email and optional constraints
   * @returns Promise resolving to the user details response
   */
  getUser(
    options: Pick<InvitationCreateInviteInterface, 'email' | 'constraints'>,
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
