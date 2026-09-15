import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';

/**
 * Refuses `?includeDeleted` on a generated route that did not opt in.
 *
 * Upstream `nestjs-crud` reads the parameter on every entity with a delete
 * column, both to return soft-deleted rows and to find the row an update or
 * delete acts on. A generated route honours it only when its operation sets
 * `includeDeleted: true`; everywhere else the request is rejected instead
 * of silently served.
 *
 * The key match mirrors upstream's parser, not the app's query parser:
 * the exact key or any bracketed form (`includeDeleted[]`,
 * `includeDeleted[x]`) counts, so no spelling upstream would read gets
 * past this check.
 */
@Injectable()
export class RejectIncludeDeletedInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const { query } = context
      .switchToHttp()
      .getRequest<{ query?: Record<string, unknown> }>();
    if (
      query !== undefined &&
      Object.keys(query).some(
        (key) => key === 'includeDeleted' || key.startsWith('includeDeleted['),
      )
    ) {
      throw new BadRequestException(
        'includeDeleted is not enabled on this route',
      );
    }
    return next.handle();
  }
}
