import { CanAccess } from '@concepta/nestjs-access-control';
import { AuthHistorySettingsInterface } from './auth-history-settings.interface';

export interface AuthHistoryOptionsInterface {
  settings?: AuthHistorySettingsInterface;
  authHistoryAccessQueryService?: CanAccess;
}
