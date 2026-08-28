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
});
