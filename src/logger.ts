import type { LogLevel } from './types';
import { logLevelValue } from './constants';

/**
 * JS-side counterpart of the native loggers.
 *
 * The JS layer needs its own gate: `setLogLevel` only used to travel to native, so JS logs kept
 * printing at `'none'`.
 *
 * Native logs the same calls, but the two surface in different places (the Metro terminal versus
 * logcat / the Xcode console), so both are kept.
 *
 * Output format is `[FlareLane][LEVEL] message`, identical across the four SDKs.
 */
class Logger {
  /** Matches the native default so behavior is unchanged until the host app opts out. */
  private static level: LogLevel = 'verbose';

  static setLevel(level: LogLevel) {
    Logger.level = level;
  }

  static verbose(message: string) {
    if (logLevelValue[Logger.level] >= logLevelValue.verbose) {
      console.log(`[FlareLane][VERBOSE] ${message}`);
    }
  }

  static error(message: string, error?: unknown) {
    if (logLevelValue[Logger.level] >= logLevelValue.error) {
      if (error === undefined) console.error(`[FlareLane][ERROR] ${message}`);
      else console.error(`[FlareLane][ERROR] ${message}`, error);
    }
  }
}

export default Logger;
