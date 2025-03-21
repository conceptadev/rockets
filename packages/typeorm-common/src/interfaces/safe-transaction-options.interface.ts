import { TransactionProxy } from '../proxies/transaction.proxy';
import { IsolationLevel } from '../types';

export interface SafeTransactionOptionsInterface {
  strict?: boolean;
  isolationLevel?: IsolationLevel;
  transaction?: TransactionProxy;
}
