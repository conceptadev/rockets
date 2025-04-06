/**
 * The token to which all JWT module settings are set.
 */
export const JWT_MODULE_SETTINGS_TOKEN = 'ROCKTS_JWT_MODULE_SETTINGS_TOKEN';

/**
 * JWT module default settings token
 */
export const JWT_MODULE_DEFAULT_SETTINGS_TOKEN =
  'ROCKTS_JWT_MODULE_DEFAULT_SETTINGS_TOKEN';

/**
 * The token to which the jwt service (for access) is set.
 */
export const JwtAccessService = Symbol(
  '__JWT_MODULE_JWT_ACCESS_SERVICE_TOKEN__',
);

/**
 * The token to which the jwt service (for refresh) is set.
 */
export const JwtRefreshService = Symbol(
  '__JWT_MODULE_JWT_REFRESH_SERVICE_TOKEN__',
);
