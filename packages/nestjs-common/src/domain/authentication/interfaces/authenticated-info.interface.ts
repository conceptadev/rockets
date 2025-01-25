import { UserOwnableInterface } from '../../user/interfaces/user-ownable.interface';

export interface AuthenticatedUserRequestInterface
  extends Pick<UserOwnableInterface, 'userId'> {
  ipAddress: string;
  authType: string;
  deviceInfo?: string | null;
  success: boolean;
  failureReason?: string | null;
}
