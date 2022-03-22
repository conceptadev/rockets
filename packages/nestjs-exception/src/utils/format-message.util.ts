import { format } from 'util';

/**
 * Format an exception error message.
 *
 * @argument {string} message The message string, optionally containing format specifiers (see util.format)
 * @argument {Array<unknown>} args Additional arguments for formatting replacement
 */
export function formatMessage(message: string, ...args: unknown[]) {
  return format(message, ...args);
}
