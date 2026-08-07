import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  CrudContextException,
  CrudContextOverlay,
} from '@concepta/nestjs-crud';

/**
 * Guarded replacement for the upstream `CrudContextOverlay` interceptor.
 *
 * Upstream `CrudModule.forRoot()` registers `CrudContextOverlay` as a
 * global `APP_INTERCEPTOR`. The overlay's `resolve()` unconditionally
 * throws `CrudContextException('No entity defined for ${ControllerName}')`
 * on any handler without `@CrudOperation` metadata — which means every
 * hand-written controller in the same app (auth/signup, /me, any bespoke
 * endpoint) returns `500 CRUD_CONTEXT_ERROR`.
 *
 * `rockets-core` swaps that unsafe global interceptor for this class (see
 * `createSafeCrudRootModule` in `rockets-core.module-definition.ts`). The
 * guard:
 *
 * 1. Delegates to `overlay.attach(context)` — identical to upstream behavior
 *    on CRUD routes.
 * 2. If upstream reports no entity for the handler, skips the overlay so
 *    non-CRUD routes pass through untouched.
 * 3. Any other CRUD context error still bubbles.
 *
 * This preserves upstream semantics for CRUD controllers while letting
 * mixed-controller apps coexist without a 500.
 */
// TODO(upstream: concepta/nestjs-crud) — remove this interceptor and
// createSafeCrudRootModule() once the published overlay safely ignores handlers
// without @CrudOperation metadata.
@Injectable()
export class SafeCrudContextInterceptor implements NestInterceptor {
  constructor(private readonly overlay: CrudContextOverlay) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    try {
      this.overlay.attach(context);
    } catch (error: unknown) {
      if (
        error instanceof CrudContextException &&
        error.message.includes('No entity defined')
      ) {
        return next.handle();
      }
      throw error;
    }
    return next.handle();
  }
}
