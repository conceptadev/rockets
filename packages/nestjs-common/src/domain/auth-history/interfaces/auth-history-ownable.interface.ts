import { ReferenceId } from '../../../reference/interfaces/reference.types';
import { AuthHistoryInterface } from './auth-history.interface';

export interface AuthHistoryOwnableInterface {
  authHistoryId: ReferenceId;
  authHistory?: AuthHistoryInterface;
}
