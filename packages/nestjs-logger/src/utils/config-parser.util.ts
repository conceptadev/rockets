import { LogLevel } from '@nestjs/common';
import { LOGGER_VALID_LOG_LEVELS } from '../config/logger.config';

/**
 * Helper to split log level string and assign to correct log level type.
 *
 * @internal
 * @param levels - Log levels to split
 */
export function splitLogLevel(levels: string): LogLevel[] {
  // trim the string
  const levelsTrimmed = levels.trim();

  // is there any length?
  if (!levels.length) {
    // no, return empty array
    return [];
  }

  // get raw strings
  const levelTypes: string[] = levelsTrimmed.split(',');

  // map all to log level enum
  return levelTypes.map((levelType) => {
    // trim the log level
    const levelTrimmed = levelType.trim() as LogLevel;
    // is the log level valid?
    if (LOGGER_VALID_LOG_LEVELS.includes(levelTrimmed)) {
      // yes
      return levelTrimmed as LogLevel;
    } else {
      // no
      throw new Error(`The string "${levelTrimmed}" is not a valid log level.`);
    }
  });
}
