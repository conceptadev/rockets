import { EntityNotFoundException } from './entity-not-found.exception';

describe(EntityNotFoundException.name, () => {
  it('should create an instance of EntityNotFoundException', () => {
    const exception = new EntityNotFoundException('TestEntity');
    expect(exception).toBeInstanceOf(EntityNotFoundException);
  });

  it('should have the correct error message', () => {
    const exception = new EntityNotFoundException('TestEntity');
    expect(exception.message).toBe(
      'Entity TestEntity was not registered to be used.',
    );
  });

  it('should have the correct context', () => {
    const exception = new EntityNotFoundException('TestEntity');
    expect(exception.context).toEqual({ entityName: 'TestEntity' });
  });

  it('should have the correct error code', () => {
    const exception = new EntityNotFoundException('TestEntity');
    expect(exception.errorCode).toBe('OTP_ENTITY_NOT_FOUND_ERROR');
  });
});
