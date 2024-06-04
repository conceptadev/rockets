import { CacheTypeNotDefinedException } from './cache-type-not-defined.exception';

describe(CacheTypeNotDefinedException.name, () => {
  it('should create an instance of CacheTypeNotDefinedException', () => {
    const exception = new CacheTypeNotDefinedException('test');
    expect(exception).toBeInstanceOf(CacheTypeNotDefinedException);
  });

  it('should have the correct error code', () => {
    const exception = new CacheTypeNotDefinedException('test');
    expect(exception.errorCode).toBe('CACHE_TYPE_NOT_DEFINED_ERROR');
  });

  it('should have the correct context', () => {
    const exception = new CacheTypeNotDefinedException('test');
    expect(exception.context).toEqual({ type: 'test' });
  });

  it('should have the correct message', () => {
    const exception = new CacheTypeNotDefinedException('test');
    expect(exception.message).toBe(
      'Type test was not defined to be used. please check config.',
    );
  });
});