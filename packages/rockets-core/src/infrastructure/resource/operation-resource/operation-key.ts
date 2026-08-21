const OPERATION_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

const RESERVED_OPERATION_KEYS = new Set([
  'constructor',
  'prototype',
  '__proto__',
  'moduleRef',
  'toString',
  'valueOf',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
]);

export function assertValidOperationKey(
  key: string,
  resourcePath: string,
): void {
  if (!OPERATION_KEY_PATTERN.test(key)) {
    throw new Error(
      `operationResource "${resourcePath}": operation key "${key}" is not a ` +
        `valid identifier / path segment (expected ${OPERATION_KEY_PATTERN})`,
    );
  }
  if (RESERVED_OPERATION_KEYS.has(key)) {
    throw new Error(
      `operationResource "${resourcePath}": operation key "${key}" is reserved ` +
        `(collides with Object.prototype or the generated controller)`,
    );
  }
}
