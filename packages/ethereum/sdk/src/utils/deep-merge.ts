export function deepMerge(result: any, ...additions: any[]) {
  for (let addition of additions) {
    for (let key in addition) {
      if (addition.hasOwnProperty(key)) {
        if (addition[key] instanceof Object && result[key] instanceof Object) {
          result[key] = deepMerge(result[key], addition[key])
        } else {
          result[key] = addition[key]
        }
      }
    }
  }
  return result
}
