import { Warning } from "@rarible/logger/build"

/**
 * Convert date to timestamp (ex. 1667988359)
 * @param date
 */
export function convertDateToTimestamp(date: Date): number {
  if (!(date && isDate(date))) {
    throw new Warning("convertDateToTimestamp: expected Date type")
  }
  return Math.floor(date.getTime() / 1000)
}

export function isDate(x: unknown): x is Date {
  return x instanceof Date
}

export function getDefaultExpirationDateTimestamp(): number {
  return convertDateToTimestamp(new Date()) + 60 * 60 * 24 * 30
}
