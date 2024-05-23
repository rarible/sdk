/* eslint-disable no-use-before-define */
type Unpromise<T> = {
  [Property in keyof T]: UnpromiseOne<T[Property]>
}

type UnpromiseOne<T> = T extends Promise<infer R> ? R : never

export function awaitAll<T>(value: T): Unpromise<T> {
  let result: any = {}
  const all: Array<Promise<any>> = []
  for (const key in value) {
    const valueKey = value[key]
    if (valueKey !== undefined && valueKey !== null && typeof valueKey === "object" && "then" in valueKey) {
      all.push(value[key] as any)
      // @ts-ignore
      ;(value[key] as any).then(r => (result[key] = r))
    }
  }

  beforeAll(async () => {
    await Promise.all(all)
  })

  return result
}
