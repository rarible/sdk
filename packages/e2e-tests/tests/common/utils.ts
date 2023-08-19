export function getEndDateAfterMonthAsDate(): Date {
	return new Date(Math.floor(Date.now() + 1000 * 60 * 60 * 24 * 30 / 1000))
}