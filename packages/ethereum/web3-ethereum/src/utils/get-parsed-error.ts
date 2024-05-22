export function getParsedError(e: any): Record<any, any> | string {
  try {
    if (typeof e === "string") {
      return e
    }
    return Object.getOwnPropertyNames(e).reduce(
      (acc, key) => {
        acc[key] = e[key]
        return acc
      },
      {} as Record<any, any>,
    )
  } catch (e) {
    return {}
  }
}
