import { CacheEntityAlreadyExistsException } from './cache-entity-already-exists.exception';

describe(CacheEntityAlreadyExistsException.name, () => {
  it('should create an instance of CacheEntityAlreadyExistsException', () => {
    const exception = new CacheEntityAlreadyExistsException('TestEntity');
    expect(exception).toBeInstanceOf(CacheEntityAlreadyExistsException);
  });

  it('should have the correct error message', () => {
    const exception = new CacheEntityAlreadyExistsException('TestEntity');
    expect(exception.message).toBe(
      'TestEntity already exists with the given key, type, and assignee ID.',
    );
  });

  it('should have the correct context', () => {
    const exception = new CacheEntityAlreadyExistsException('TestEntity');
    expect(exception.context).toEqual({ entityName: 'TestEntity' });
  });

  it('should have the correct error code', () => {
    const exception = new CacheEntityAlreadyExistsException('TestEntity');
    expect(exception.errorCode).toBe('CACHE_ENTITY_ALREADY_EXISTS_ERROR');
  });
});