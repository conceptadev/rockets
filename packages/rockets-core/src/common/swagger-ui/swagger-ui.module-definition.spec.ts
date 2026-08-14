import { ConfigModule } from '@nestjs/config';
import { describe, expect, it } from 'vitest';

import { SwaggerUiModule } from './swagger-ui.module';

class SecretsModule {}

describe('SwaggerUiModule definition', () => {
  it('preserves caller imports for async factory dependencies', () => {
    const definition = SwaggerUiModule.registerAsync({
      imports: [SecretsModule],
      useFactory: () => ({}),
    });

    expect(definition.imports).toContain(SecretsModule);
  });

  it('appends the package-owned Swagger configuration import', () => {
    const definition = SwaggerUiModule.registerAsync({
      imports: [SecretsModule],
      useFactory: () => ({}),
    });

    expect(definition.imports).toContainEqual(
      expect.objectContaining({ module: ConfigModule }),
    );
  });

  it('does not leak synchronous options onto DynamicModule metadata', () => {
    const definition = SwaggerUiModule.register({
      settings: { path: 'docs' },
    });

    expect(definition).not.toHaveProperty('settings');
  });
});
