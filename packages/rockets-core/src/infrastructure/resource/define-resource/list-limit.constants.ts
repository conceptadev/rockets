/**
 * Largest page a generated `list` route returns when its operation sets no
 * `maxLimit`. Without a cap, upstream `nestjs-crud` returns every row.
 */
export const DEFAULT_LIST_MAX_LIMIT = 100;
