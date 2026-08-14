import { describe, it, expect } from 'vitest';
import { ResourceKind } from './resource-kind.enum';

describe('ResourceKind enum', () => {
  it('exposes the four discriminator values', () => {
    expect(ResourceKind.Crud).toBe('crud');
    expect(ResourceKind.Module).toBe('module');
    expect(ResourceKind.Sub).toBe('sub');
    expect(ResourceKind.Operation).toBe('operation');
  });

  it('values are pairwise distinct', () => {
    const values = [
      ResourceKind.Crud,
      ResourceKind.Module,
      ResourceKind.Sub,
      ResourceKind.Operation,
    ];
    expect(new Set(values).size).toBe(values.length);
  });
});
