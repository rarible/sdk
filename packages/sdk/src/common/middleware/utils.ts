/**
 * Promisified value
 *
 * @param val - any value
 * @return val if it already promise, or Promise.resole(val)
 */
export function toPromise(val: any): Promise<any> {
	if (val.then !== undefined) {
		return val
	} else {
		return Promise.resolve(val)
	}
}
