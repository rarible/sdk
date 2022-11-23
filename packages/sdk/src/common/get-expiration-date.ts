/**
 * Convert date to timestamp (ex. 1667988359)
 * @param date
 */
export function convertDateToTimestamp(date: Date | undefined): number | undefined {
	return date instanceof Date
		? Math.floor(date.getTime() / 1000)
		: undefined
}
