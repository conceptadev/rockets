export interface InvitationAttemptServiceInterface {
  send(code: string): Promise<void>;
}
