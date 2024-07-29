export function readEnv(name: string) {
  if (typeof process === "object") {
    const val = process.env[name]
    if (typeof val === "string") return val
    throw new Error(`No env provided - ${name}`)
  }
  throw new Error("Not a node env")
}

export function readEnvSafe(name: string): string | undefined {
  if (typeof process === "object") {
    const val = process.env[name]
    if (typeof val === "string") return val
    return undefined
  }
  throw new Error("Not a node env")
}
