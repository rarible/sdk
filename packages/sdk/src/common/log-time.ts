export async function logTime<T>(task: string, f: () => Promise<T>): Promise<T> {
	const start = new Date()
	console.log(`${start}: '${task}'`)
	try {
		return await f()
	} finally {
		const now = new Date()
		console.log(`${now}: finished '${task}' in ${now.getTime() - start.getTime()}ms`)
	}
}
