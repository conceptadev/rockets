import { Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { SafeTransactionOptionsInterface } from '../interfaces/safe-transaction-options.interface';
import { RunInTransactionCallback } from '../typeorm-common.types';

/**
 * Safe transaction wrapper.
 *
 * Use this utility method to detect if the entity manager's driver supports transactions.
 *
 * To silently ignore drivers that don't support transactions, set strict mode to false.
 * In this case, your `runInTransaction` callback will receive `undefined` for the value
 * of `entityManager`.
 *
 * @param entityManager Entity manager instance
 * @param runInTransaction Transaction callback
 * @param options Options
 * @returns
 */
export async function safeTransaction<T>(
  entityManager: EntityManager,
  runInTransaction: RunInTransactionCallback<T>,
  options: SafeTransactionOptionsInterface = { strict: true },
): Promise<T> {
  // get the driver
  const { driver } = entityManager.connection;

  // does the driver has transaction support?
  if (driver.transactionSupport === 'none') {
    // no... log some debug info
    Logger.debug(
      `Transactions are not supported for the ${driver.options.type} database type.`,
    );

    // is strict mode enabled?
    if (options.strict === true) {
      // yes, bail out
      const error = new Error(
        `Safe transaction wrapper was called with strict enabled,` +
          ` and the ${driver.options.type} database does not support transactions.`,
      );
      // log
      Logger.error(error);
      // throw
      throw error;
    }

    // run the transaction with undefined manager value
    return runInTransaction(undefined);
  } else {
    // is an isolation level set?
    if (options?.isolationLevel) {
      // yes, enforce it
      return entityManager.transaction(
        options.isolationLevel,
        runInTransaction,
      );
    } else {
      // run without isolation level specified
      return entityManager.transaction(runInTransaction);
    }
  }
}
