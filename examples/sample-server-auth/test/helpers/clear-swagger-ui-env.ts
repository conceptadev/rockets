/**
 * Removes every `SWAGGER_UI_*` variable from `process.env`.
 *
 * `swaggerUiDefaultConfig` in rockets-core reads `SWAGGER_UI_TITLE`,
 * `SWAGGER_UI_VERSION`, `SWAGGER_UI_DESCRIPTION`, `SWAGGER_UI_CONTACT_*`,
 * `SWAGGER_UI_LICENSE_*` and friends into the OpenAPI `info` block. Those are
 * per-deployment configuration, not part of the wire contract — but they land
 * in the generated document all the same, so a byte-for-byte contract check
 * run on a machine with any of them exported would report drift that does not
 * exist.
 *
 * Call this BEFORE `NestFactory.create`: the config factory is evaluated
 * during module initialization.
 */
export function clearSwaggerUiEnv(): void {
  for (const key of Object.keys(process.env)) {
    if (key.startsWith('SWAGGER_UI_')) {
      delete process.env[key];
    }
  }
}
