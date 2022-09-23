import { mock } from 'jest-mock-extended';
import { EntityManager } from 'typeorm';

export function createEntityManagerMock(): EntityManager {
  return mock<EntityManager>({
    connection: { driver: { transactionSupport: 'simple' } },
    transaction: async (...args: Array<unknown>) => {
      if (args[0] instanceof Function) {
        return args[0]();
      } else if (args[1] instanceof Function) {
        return args[1]();
      }
    },
  });
}
