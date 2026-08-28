import Logger from '../logger';
import { logLevelValue } from '../constants';
import { convertLogLevel } from '../utils';

describe('Logger level gate', () => {
  let log: jest.SpyInstance;
  let error: jest.SpyInstance;

  beforeEach(() => {
    log = jest.spyOn(console, 'log').mockImplementation(() => {});
    error = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Logger.setLevel('verbose');
  });

  it('none silences every level', () => {
    Logger.setLevel('none');

    Logger.verbose('flow');
    Logger.error('failure');

    expect(log).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('error passes failures only', () => {
    Logger.setLevel('error');

    Logger.verbose('flow');
    Logger.error('failure');

    expect(log).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith('[FlareLane][ERROR] failure');
  });

  it('verbose passes both, tagged with the shared format', () => {
    Logger.setLevel('verbose');

    Logger.verbose('flow');
    Logger.error('failure');

    expect(log).toHaveBeenCalledWith('[FlareLane][VERBOSE] flow');
    expect(error).toHaveBeenCalledWith('[FlareLane][ERROR] failure');
  });
});

describe('convertLogLevel', () => {
  // Regression: `logLevelValue[level] || fallback` treated none (0) as missing and sent
  // verbose instead, so setLogLevel('none') used to raise verbosity on iOS.
  it('maps none to 0 rather than falling back to verbose', () => {
    expect(convertLogLevel('none')).toBe(0);
  });

  it('maps the remaining levels to the shared wire values', () => {
    expect(convertLogLevel('error')).toBe(logLevelValue.error);
    expect(convertLogLevel('verbose')).toBe(logLevelValue.verbose);
  });

  it('falls back to verbose for an unknown level', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(convertLogLevel('loud' as any)).toBe(logLevelValue.verbose);
    expect(error).toHaveBeenCalled();

    error.mockRestore();
  });

  // Regression: `in` also accepts inherited keys, so 'constructor' returned a
  // function instead of a wire value.
  it('treats inherited object keys as unknown levels', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(convertLogLevel('constructor' as any)).toBe(logLevelValue.verbose);

    error.mockRestore();
  });
});

describe('Logger.setLevel', () => {
  afterEach(() => Logger.setLevel('verbose'));

  // Regression: an unmapped level stored as-is silenced every JS log while
  // native fell back to verbose.
  it('normalizes an unknown level to verbose instead of going silent', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});

    Logger.setLevel('loud' as any);
    Logger.verbose('still audible');

    expect(log).toHaveBeenCalledWith('[FlareLane][VERBOSE] still audible');
    log.mockRestore();
  });
});
