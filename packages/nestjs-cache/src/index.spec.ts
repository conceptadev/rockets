import { CacheModule, CacheService, CacheCreateDto } from './index';

describe('index', () => {
  it('should be an instance of Function', () => {
    expect(CacheModule).toBeInstanceOf(Function);
  });

  it('should be an instance of Function', () => {
    expect(CacheService).toBeInstanceOf(Function);
  });

  it('should be an instance of Function', () => {
    expect(CacheCreateDto).toBeInstanceOf(Function);
  });
});
