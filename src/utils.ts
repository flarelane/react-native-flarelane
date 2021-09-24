import { Platform } from 'react-native';
import { androidLogLevel, iOSLogLevel } from './constants';
import type { LogLevel } from './types';

// ----- VALIDATOR -----

const checkNullable = (is: boolean, val: any) => (is ? val !== null : true);

export const isValidCallback = (
  callback: any,
  method: string,
  nullable: boolean = false
) => {
  if (typeof callback !== 'function' && checkNullable(nullable, callback)) {
    console.error(`FlareLane - Please set callback or function in ${method}.`);
    return false;
  }
  return true;
};

export const isString = (
  string: any,
  method: string,
  nullable: boolean = false
): boolean => {
  if (typeof string !== 'string' && checkNullable(nullable, string)) {
    console.error(`FlareLane - Please set string in ${method}.`);
    return false;
  }
  return true;
};

export const isBoolean = (boolean: any, method: string): boolean => {
  if (typeof boolean !== 'boolean') {
    console.error(`FlareLane - Please set boolean in ${method}.`);
    return false;
  }
  return true;
};

export const isArray = (array: any, method: string): boolean => {
  if (!Array.isArray(array)) {
    console.error(`FlareLane - Please set array in ${method}`);
    return false;
  }
  return true;
};

const isObject = (o: any) => {
  return Object.prototype.toString.call(o) === '[object Object]';
};

export const isPlainObject = (o: any, method: string): boolean => {
  let is = true;
  let ctor, prot;

  if (isObject(o) === false) {
    is = false;
  }

  ctor = o.constructor;
  if (ctor === undefined) {
    is = true;
  }

  prot = ctor.prototype;
  if (isObject(prot) === false) {
    is = false;
  }

  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    is = false;
  }

  if (!is) {
    console.error(`FlareLane - Please set plainObject in ${method}`);
  }
  return is;
};

// ----- FUNCTION -----

export const convertLogLevel = (logLevel: LogLevel) => {
  let convertedLevel;

  if (Platform.OS === 'ios') {
    convertedLevel = iOSLogLevel[logLevel] || 5;
  } else {
    convertedLevel = androidLogLevel[logLevel] || 2;
  }

  if (
    typeof iOSLogLevel[logLevel] === 'undefined' ||
    typeof androidLogLevel[logLevel] === 'undefined'
  )
    console.warn(
      `FlareLane - Cannot set ${logLevel} in setLogLevel. Please set one of none, error, verbose.`
    );

  return convertedLevel;
};

// ----- HANDLER -----

export const publicMethodErrorHandler = (error: Error, method: string) => {
  console.error(`FlareLane - Caught an unknown errors in ${method}.`, error);
};
