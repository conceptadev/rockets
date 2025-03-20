import { mock } from 'jest-mock-extended';
import { EntityManagerProxy } from './entity-manager.proxy';
import { TransactionProxy } from './transaction.proxy';
import { EntityManagerInterface } from '../interfaces/entity-manager-repository.interface';
import { RepositoryInterface } from '../interfaces/repository.interface';

class TestEntity {}
describe(EntityManagerProxy.name, () => {
  let entityManager: EntityManagerInterface;
  let entityManagerProxy: EntityManagerProxy;
  let repositoryMock: RepositoryInterface<TestEntity>;

  beforeEach(() => {
    entityManager = mock<EntityManagerInterface>();
    entityManagerProxy = new EntityManagerProxy(entityManager);
    repositoryMock = mock<RepositoryInterface<TestEntity>>();
  });

  describe('entityManager()', () => {
    it('should return the injected EntityManager', () => {
      const result = entityManagerProxy.entityManager();
      expect(result).toBe(entityManager);
    });
  });

  describe('repository()', () => {
    it('should return the original repository if no options provided', () => {
      const result = entityManagerProxy.repository(repositoryMock);
      expect(result).toBe(repositoryMock);
    });

    it('should return a repository from a transaction if transaction option provided', async () => {
      const transactionProxy = mock<TransactionProxy>();
      const transactionRepository = mock<RepositoryInterface<TestEntity>>();
      await transactionProxy.repository(repositoryMock);

      jest.spyOn(transactionProxy, 'repository').mockImplementationOnce(() => {
        return transactionRepository;
      });

      const options = { transaction: transactionProxy };
      const result = entityManagerProxy.repository(repositoryMock, options);
      expect(result).toBe(transactionRepository);
    });
  });

  describe('transaction()', () => {
    it('should create a TransactionProxy with the EntityManager', () => {
      const result = entityManagerProxy.transaction();
      expect(result).toBeInstanceOf(TransactionProxy);
    });
  });
});
