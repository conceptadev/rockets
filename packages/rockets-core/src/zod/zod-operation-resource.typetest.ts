/**
 * Compile-only checks for operationResource authoring (#50).
 * Run: `yarn workspace @concepta/rockets-core test:typetests`.
 */
import { z } from 'zod';

import { operationResource } from './zod-operation-resource';
import type { PathParams } from './zod-operation-resource';

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <
  V,
>() => V extends U ? 1 : 2
  ? true
  : false;

type ExpectTrue<T extends true> = T;

type _PetsParams = ExpectTrue<
  AssertEqual<PathParams<'pets/:petId'>, { petId: string }>
>;
type _NestedParams = ExpectTrue<
  AssertEqual<
    PathParams<'orgs/:orgId/pets/:petId'>,
    { orgId: string; petId: string }
  >
>;
type _NoParams = ExpectTrue<AssertEqual<PathParams<'ops'>, {}>>;

export const typedTransfer = operationResource({
  path: 'pets/:petId',
  operations: (op) => ({
    transfer: op.write({
      input: z.object({ newOwnerId: z.string() }),
      output: z.object({ id: z.string() }),
      handler: (ctx) => {
        const petId: string = ctx.params.petId;
        const owner: string = ctx.input.newOwnerId;
        // @ts-expect-error — unknown path param
        const missing: string = ctx.params.missing;
        void petId;
        void owner;
        void missing;
        return { id: ctx.params.petId };
      },
    }),
  }),
});

type AuthoredHandler = (typeof typedTransfer.authored.transfer)['handler'];
type AuthoredFn = Extract<AuthoredHandler, (ctx: never) => unknown>;
type AuthoredCtx = Parameters<AuthoredFn>[0];
type _AuthoredInput = ExpectTrue<
  AssertEqual<AuthoredCtx['input'], { newOwnerId: string }>
>;
type _AuthoredParams = ExpectTrue<
  AssertEqual<AuthoredCtx['params'], Readonly<{ petId: string }>>
>;

operationResource({
  path: 'x',
  operations: (op) => ({
    bad: op.read({
      // @ts-expect-error — read builder only accepts GET
      method: 'POST',
      handler: () => ({ ok: true }),
    }),
  }),
});

operationResource({
  path: 'y',
  operations: (op) => ({
    bad: op.write({
      // @ts-expect-error — write builder rejects DELETE
      method: 'DELETE',
      handler: () => ({ ok: true }),
    }),
  }),
});

void typedTransfer;
