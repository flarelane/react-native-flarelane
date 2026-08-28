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
    // Own-property check with a verbose fallback: plain-JS callers can pass any string,
    // and an unmapped level must not silently disable JS logs while native falls back
    // to verbose.
    Logger.level = Object.prototype.hasOwnProperty.call(logLevelValue, level)
      ? level
      : 'verbose';
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
