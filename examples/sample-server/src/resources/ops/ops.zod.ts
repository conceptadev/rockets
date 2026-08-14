import { command, operationResource, query } from '@concepta/rockets-core/zod';
import { z } from 'zod';

/**
 * Sample coverage for issue #43 v1 (`operationResource` / `query` / `command`):
 * - public query on a secured resource (`GET /ops`)
 * - authenticated command with Zod input/output (`POST /ops/shout` → 201)
 */
export const opsResource = operationResource({
  path: 'ops',
  tags: ['Ops'],
  operations: {
    ping: query({
      public: true,
      summary: 'Health ping',
      output: z.object({ ok: z.boolean() }),
      handler: () => ({ ok: true }),
    }),
    shout: command({
      path: 'shout',
      status: 201,
      summary: 'Uppercase a string',
      input: z.object({ text: z.string().min(1) }),
      output: z.object({ text: z.string() }),
      handler: ({ input }) => ({ text: input.text.toUpperCase() }),
    }),
  },
});
