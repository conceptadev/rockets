import { z } from 'zod';
import { baseEntity } from './base-entity';
import { f } from './fields';

/**
 * Type-level contract for `f.compute` callbacks. Run with
 * `yarn workspace @conceptadev/rockets-core test:typetests`.
 *
 * The division of labour: the runtime strip in `compileDtoClass` decides
 * which KEYS may ship (undeclared and `response: false` keys are removed
 * and cannot leak); TypeScript decides the value TYPES. Runtime `parse`
 * is deliberately not used — it would reject the legitimate case below.
 */

const tagSchema = baseEntity({
  name: f.string({ min: 1, max: 100 }),
  color: f.string({ max: 20 }).optional(),
});

interface TagRow {
  readonly id: string;
  readonly name: string;
  readonly color?: string;
  readonly dateCreated: Date;
  readonly dateUpdated: Date;
  /** A column the wire schema does not declare — stripped at runtime. */
  readonly internalCost: number;
}

declare const tagRows: TagRow[];

// ── ALLOWED ───────────────────────────────────────────────────────────
// Re-emitting ORM rows: `dateCreated` is documented as an ISO string but
// arrives as a Date, and the row carries an undeclared column. Both are
// fine — the serializer converts the Date and strips `internalCost`.
export const reemitsOrmRows = f.compute(z.array(tagSchema), () => tagRows);

// Hand-built objects that match the declared types.
export const handBuilt = f.compute(z.array(tagSchema), () =>
  tagRows.map((tag) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
    dateCreated: tag.dateCreated,
    dateUpdated: tag.dateUpdated,
  })),
);

// ── REJECTED ──────────────────────────────────────────────────────────
// Wrong value type on a declared key: `name` is a string in the schema.
// The mismatch surfaces on the callback's return expression.
export const wrongValueType = f.compute(z.array(tagSchema), () =>
  // @ts-expect-error — name: number is not assignable to string | Date
  tagRows.map((tag) => ({
    id: tag.id,
    name: tag.internalCost,
    dateCreated: tag.dateCreated,
    dateUpdated: tag.dateUpdated,
  })),
);

// Reading a property that does not exist on the source row: without the
// typed return this silently produced `undefined` on the wire.
export const missingSourceProperty = f.compute(z.array(tagSchema), () =>
  tagRows.map((tag) => ({
    id: tag.id,
    name: tag.name,
    // @ts-expect-error — 'colorCode' does not exist on TagRow
    color: tag.colorCode,
    dateCreated: tag.dateCreated,
    dateUpdated: tag.dateUpdated,
  })),
);
