import { formatTokenUrl } from './auth-recovery.utils';

describe('formatTokenUrl', () => {
  it('should return the correct URL', () => {
    const baseUrl = 'https://example.com';
    const passcode = '123456';
    const expectedUrl = 'https://example.com/123456';

    const result = formatTokenUrl(baseUrl, passcode);

    expect(result).toBe(expectedUrl);
  });
});
