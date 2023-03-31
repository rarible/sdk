
type Wrapper<T> = { value: T }

export function awaitIt<T>(value: Promise<T>): Wrapper<T> {
	const result: Wrapper<T> = {} as any
	value.then(r => result.value = r)
	beforeAll(async () => {
		await value
	})
	return result
}
