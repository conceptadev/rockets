import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import { TransactionProxy } from '../proxies/transaction.proxy';

export interface SafeTransactionOptionsInterface {
  strict?: boolean;
  isolationLevel?: IsolationLevel;
  transaction?: TransactionProxy;
}
