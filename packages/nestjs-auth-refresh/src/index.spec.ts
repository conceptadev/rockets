import { AuthRefreshModule, RefreshAuthGuard } from './index';

describe('Index', () => {
  it('should be defined', () => {
    expect(AuthRefreshModule).toBeInstanceOf(Function);
  });
  it('should be defined', () => {
    expect(RefreshAuthGuard).toBeInstanceOf(Function);
  });
});
