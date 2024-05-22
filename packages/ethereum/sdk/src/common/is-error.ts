export function isError(x: unknown): x is Error {
  return typeof x === "object" && x !== null && "message" in x
}
