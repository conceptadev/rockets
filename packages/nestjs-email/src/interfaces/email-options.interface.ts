import { EmailServiceInterface } from './email-service.interface';
import { EmailSettingsInterface } from './email-settings.interface';

export interface EmailOptionsInterface {
  settings?: EmailSettingsInterface;
  mailerService: EmailServiceInterface;
}
