import {
  ERROR_CODE_UNKNOWN,
  ERROR_CODE_HTTP_UNKNOWN,
  ERROR_CODE_HTTP_BAD_REQUEST,
  ERROR_CODE_HTTP_NOT_FOUND,
  ERROR_CODE_HTTP_INTERNAL_SERVER_ERROR,
  HTTP_ERROR_CODE,
  ERROR_MESSAGE_FALLBACK,
} from './error-codes.constants';

describe('Error Codes Constants', () => {
  it('should export the correct error codes', () => {
    expect(ERROR_CODE_UNKNOWN).toBe('UNKNOWN');
    expect(ERROR_CODE_HTTP_UNKNOWN).toBe('HTTP_UNKNOWN');
    expect(ERROR_CODE_HTTP_BAD_REQUEST).toBe('HTTP_BAD_REQUEST');
    expect(ERROR_CODE_HTTP_NOT_FOUND).toBe('HTTP_NOT_FOUND');
    expect(ERROR_CODE_HTTP_INTERNAL_SERVER_ERROR).toBe(
      'HTTP_INTERNAL_SERVER_ERROR',
    );
  });

  it('should export the correct error strings', () => {
    expect(ERROR_MESSAGE_FALLBACK).toBe('Internal Server Error');
  });

  it('should have the correct HTTP error codes in the map', () => {
    expect(HTTP_ERROR_CODE.get(400)).toBe(ERROR_CODE_HTTP_BAD_REQUEST);
    expect(HTTP_ERROR_CODE.get(404)).toBe(ERROR_CODE_HTTP_NOT_FOUND);
    expect(HTTP_ERROR_CODE.get(500)).toBe(
      ERROR_CODE_HTTP_INTERNAL_SERVER_ERROR,
    );
  });
});
