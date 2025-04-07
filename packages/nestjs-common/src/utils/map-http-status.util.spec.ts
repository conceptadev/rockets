import { mapHttpStatus } from '../utils/map-http-status.util';
import { ERROR_CODE_HTTP_UNKNOWN } from '../constants/error-codes.constants';

describe(mapHttpStatus.name, () => {
  it('should return the error code for a given status code', () => {
    const statusCode = 404;
    const expectedErrorCode = 'HTTP_NOT_FOUND';

    const result = mapHttpStatus(statusCode);

    expect(result).toBe(expectedErrorCode);
  });

  it('should return the unknown error code for an unknown status code', () => {
    const statusCode = 999;
    const expectedErrorCode = ERROR_CODE_HTTP_UNKNOWN;

    const result = mapHttpStatus(statusCode);

    expect(result).toBe(expectedErrorCode);
  });
});
