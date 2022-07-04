import { AuthRecoveryEmailServiceInterface } from './auth-recovery-email.service.interface';

export interface AuthRecoveryEmailOptionsInterface {
  mailerService?: AuthRecoveryEmailServiceInterface;
}
