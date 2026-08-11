import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Rate-limits on the IP **and** the targeted account combined, not one or the
 * other. Keying on the account alone lets one attacker lock a victim out of
 * login by naming their username; keying on IP alone misses distributed
 * attacks and collapses behind a load balancer. The composite key limits the
 * `(ip, account)` pair, so an attacker only ever throttles themselves.
 * Requests that name no account fall back to the upstream IP tracker.
 */
@Injectable()
export class AuthAccountThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const ipTracker = await super.getTracker(req);
    const body: unknown = req.body;
    if (typeof body === 'object' && body !== null) {
      const target =
        this.readStringField(body, 'email') ??
        this.readStringField(body, 'username');
      if (target !== undefined) {
        return `${ipTracker}::${target.toLowerCase()}`;
      }
    }
    return ipTracker;
  }

  private readStringField(source: object, key: string): string | undefined {
    const value: unknown = Reflect.get(source, key);
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }
}
