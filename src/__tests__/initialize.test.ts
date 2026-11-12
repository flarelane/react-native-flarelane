// Spec for how `FlareLane.initialize` hands its arguments to the native module.
//
// The native SDKs own region validation; the JS layer only passes the value through and
// maps an omitted region to `null` (never an empty string), which native reads as "us".

jest.mock('react-native', () => ({
  NativeModules: {
    FlareLane: { initialize: jest.fn(), setLogLevel: jest.fn() },
  },
  Platform: { OS: 'ios' },
  NativeEventEmitter: jest.fn().mockImplementation(() => ({
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
  })),
}));

import { NativeModules } from 'react-native';
import FlareLane from '../index';

const mockInitialize = (NativeModules as any).FlareLane.initialize;

describe('FlareLane.initialize', () => {
  beforeEach(() => mockInitialize.mockClear());

  it('keeps the existing call shape and sends a null region (native default "us")', () => {
    FlareLane.initialize('P');
    expect(mockInitialize).toHaveBeenCalledWith('P', true, null);

    FlareLane.initialize('P', false);
    expect(mockInitialize).toHaveBeenLastCalledWith('P', false, null);
  });

  it('passes the region through untouched for native to validate', () => {
    FlareLane.initialize('P', true, 'kr');
    expect(mockInitialize).toHaveBeenLastCalledWith('P', true, 'kr');

    FlareLane.initialize('P', true, ' KR ');
    expect(mockInitialize).toHaveBeenLastCalledWith('P', true, ' KR ');

    FlareLane.initialize('P', true, null);
    expect(mockInitialize).toHaveBeenLastCalledWith('P', true, null);
  });

  it('does not reach native when region is not a string', () => {
    FlareLane.initialize('P', true, 1 as unknown as string);
    expect(mockInitialize).not.toHaveBeenCalled();
  });
});
