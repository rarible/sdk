export function getStringifiedData(data: any): string | undefined {
  try {
    if (typeof data === "string") {
      return data
    }
    const errorObject = Object.getOwnPropertyNames(data).reduce(
      (acc, key) => {
        acc[key] = data[key]
        return acc
      },
      {} as Record<any, any>,
    )
    return JSON.stringify(errorObject, getErrorsReplacer(), "  ")
  } catch (e) {
    return undefined
  }
}

function getErrorsReplacer() {
  const objectCache = new WeakSet()

  return (key: string, value: any): any => {
    try {
      if (typeof value === "object" && value !== null) {
        if (objectCache.has(value)) {
          return
        }
        objectCache.add(value)
      }
      if (value instanceof Error) {
        const error: Record<string | number | symbol, unknown> = {}

        Object.getOwnPropertyNames(value).forEach(function (propName) {
          // @ts-ignore
          error[propName] = value[propName]
        })

        return error
      }
    } catch (_) {}

    return value
  }
}
