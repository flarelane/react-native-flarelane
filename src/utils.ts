import { logLevelValue } from './constants';
import Logger from './logger';
import type { LogLevel } from './types';

// ----- VALIDATOR -----

const checkNullable = (is: boolean, val: any) => (is ? val !== null : true);

export const isValidCallback = (
  callback: any,
  method: string,
  nullable: boolean = false
) => {
  if (typeof callback !== 'function' && checkNullable(nullable, callback)) {
    Logger.error(`Please set callback or function in ${method}.`);
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
    Logger.error(`Please set string in ${method}.`);
    return false;
  }
  return true;
};

export const isBoolean = (boolean: any, method: string): boolean => {
  if (typeof boolean !== 'boolean') {
    Logger.error(`Please set boolean in ${method}.`);
    return false;
  }
  return true;
};

export const isArray = (array: any, method: string): boolean => {
  if (!Array.isArray(array)) {
    Logger.error(`Please set array in ${method}.`);
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
    Logger.error(`Please set plainObject in ${method}.`);
  }
  return is;
};

// ----- FUNCTION -----

export const convertLogLevel = (logLevel: LogLevel) => {
  // Membership check, not a falsy check: `none` is 0, so `logLevelValue[logLevel] || fallback`
  // used to silently turn `none` into verbose.
  if (logLevel in logLevelValue) return logLevelValue[logLevel];

  Logger.error(
    `Cannot set ${logLevel} in setLogLevel. Please set one of none, error, verbose.`
  );
  return logLevelValue.verbose;
};

// ----- HANDLER -----

export const publicMethodErrorHandler = (error: Error, method: string) => {
  Logger.error(`Caught an unknown error in ${method}.`, error);
};
