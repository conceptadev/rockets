/**
 * One structured validation finding, machine-readable.
 *
 * `path` is an ARRAY of segments, not a dotted string: `0` (array index)
 * and `"0"` (object key) are different addresses, and a key containing a
 * dot would corrupt a joined form. Join it yourself if you want a label.
 * The zod producer preserves numeric segments; class-validator-based
 * producers report array children as string keys, because that is what
 * class-validator itself exposes.
 */
export interface RocketsErrorDetail {
  readonly path: readonly (string | number)[];
  readonly message: string;
}
