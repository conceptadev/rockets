import { describe, expect, it } from 'vitest';

import { StandardSchemaModule } from './standard-schema.module';

describe(StandardSchemaModule.name, () => {
  it('registers validation and serialization by default', () => {
    const module = StandardSchemaModule.forRoot();

    expect(module.module).toBe(StandardSchemaModule);
    expect(module.providers).toHaveLength(2);
  });

  it('allows either native integration to be disabled', () => {
    const module = StandardSchemaModule.forRoot({
      validation: false,
      serialization: false,
    });

    expect(module.providers).toEqual([]);
  });
});
