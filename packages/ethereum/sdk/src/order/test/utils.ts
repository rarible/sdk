export function getEndDateAfterMonth(): number {
	return Math.floor((Date.now() + 1000 * 60 * 60 * 24 * 30) / 1000)
}
