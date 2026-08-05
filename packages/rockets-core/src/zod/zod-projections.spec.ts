import type { PlainLiteralObject, Type } from '@nestjs/common';
import { z } from 'zod';
import { rocketsFieldMeta } from './field-meta';
import { f } from './fields';
import { projectSchema } from './zod-projections';

describe('projectSchema response exposure', () => {
  class PetEntity {
    id!: string;
  }
  const entity = PetEntity as Type<PlainLiteralObject>;
  const noOwner = new Set<string>();

  const responseKeys = (schema: z.ZodObject): string[] =>
    Object.keys(projectSchema('Pet', schema, entity, noOwner).response);

  /** Narrows `optional(array(object))` down to the element's keys. */
  const computedElementKeys = (field: z.ZodType | undefined): string[] => {
    const inner = field instanceof z.ZodOptional ? field.unwrap() : field;
    if (!(inner instanceof z.ZodArray)) {
      throw new Error('expected a computed array field');
    }
    const element = inner.element;
    if (!(element instanceof z.ZodObject)) {
      throw new Error('expected an object element');
    }
    return Object.keys(element.shape);
  };

  /**
   * Non-base fields must opt in via `dto.response:true` (or via `f.*`
   * helpers, which register that flag by default). Raw zod without meta
   * stays hidden — forgetting to annotate fails closed.
   */
  it('does not expose ordinary non-base fields without dto.response:true', () => {
    const schema = z.object({
      id: f.pk(),
      name: z.string(),
      dateCreated: f.createdAt(),
    });
    expect(responseKeys(schema)).toEqual(['id', 'dateCreated']);
  });

  it('exposes a non-base field only when dto.response is explicitly true', () => {
    const schema = z.object({
      id: f.pk(),
      name: z.string().register(rocketsFieldMeta, { dto: { response: true } }),
      internalNote: z.string(),
    });
    expect(responseKeys(schema)).toEqual(['id', 'name']);
  });

  /**
   * Secrets are kept out by NOT opting them in — the default already
   * fails closed. There is no name-based heuristic, on purpose: it would
   * eat harmless fields (`hashtags`, `tokenExpiresAt`) while missing the
   * ones that matter (`apiKey`, `salt`, `cardNumber`).
   */
  it('hides unannotated credential columns, whatever they are named', () => {
    const schema = z.object({
      id: f.pk(),
      passwordHash: z.string(),
      apiKey: z.string(),
      salt: z.string(),
    });
    expect(responseKeys(schema)).toEqual(['id']);
  });

  it('does not second-guess the author on harmless credential-ish names', () => {
    const schema = z.object({
      id: f.pk(),
      tokenExpiresAt: f.string(),
      mfaEnabled: f.bool(),
      hashtags: f.string(),
    });
    expect(responseKeys(schema)).toEqual([
      'id',
      'tokenExpiresAt',
      'mfaEnabled',
      'hashtags',
    ]);
  });

  it('keeps an f.* field out once it opts out, credential-shaped or not', () => {
    const schema = z.object({
      id: f.pk(),
      passwordHash: f.string({ dto: { response: false } }),
      apiKey: f.string({ dto: { response: false } }),
    });
    expect(responseKeys(schema)).toEqual(['id']);
  });

  it('honours an explicit dto.response=false on a base-entity field', () => {
    const schema = z.object({
      id: f.pk(),
      dateCreated: f
        .createdAt()
        .register(rocketsFieldMeta, { dto: { response: false } }),
    });
    expect(responseKeys(schema)).toEqual(['id']);
  });

  it('f.* scalars opt into the response DTO by default', () => {
    const schema = z.object({
      id: f.pk(),
      title: f.string(),
      age: f.int(),
    });
    expect(responseKeys(schema)).toEqual(['id', 'title', 'age']);
  });

  /**
   * A compute schema is an explicit wire declaration, so it is not
   * subject to the opt-in rule — but an explicit `response: false` still
   * has to hold, because compute schemas are routinely built from an
   * entity schema that carries hidden columns.
   */
  it('strips dto.response=false out of a computed field schema', () => {
    const nested = z.object({
      id: f.pk(),
      label: f.string(),
      internalNote: f.string({ dto: { response: false } }),
    });
    const schema = z.object({
      id: f.pk(),
      items: f.compute(z.array(nested), () => []).optional(),
    });

    const { response } = projectSchema('Pet', schema, entity, noOwner);
    expect(computedElementKeys(response.items)).toEqual(['id', 'label']);
  });

  it('leaves a computed field untouched when nothing is hidden', () => {
    const nested = z.object({ id: f.pk(), label: f.string() });
    const computed = f.compute(z.array(nested), () => []);
    const schema = z.object({ id: f.pk(), items: computed });

    const { response } = projectSchema('Pet', schema, entity, noOwner);
    expect(response.items).toBe(computed);
  });

  it('f.* can still opt out with dto.response=false', () => {
    const schema = z.object({
      id: f.pk(),
      title: f.string(),
      internalNote: f.string({ dto: { response: false } }),
    });
    expect(responseKeys(schema)).toEqual(['id', 'title']);
  });
});
