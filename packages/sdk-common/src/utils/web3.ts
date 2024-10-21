import { getMajorVersion, hasVersion, isObjectLike } from "./types"
function getWeb3v1Version(x: unknown): string | undefined {
  if (!hasVersion(x)) return undefined
  return x.version
}
export function isWeb3v1(web3Instance: unknown): boolean {
  const version = getWeb3v1Version(web3Instance)
  if (!version) return false
  return getMajorVersion(version) === "1"
}

interface FunctionWithOptionalVersion extends Function {
  version: string
}
function hasVersionFnField(fn: Function): fn is FunctionWithOptionalVersion {
  return "version" in fn
}
export function getWeb3Version(web3Instance: unknown): string | undefined {
  if (!(isObjectLike(web3Instance) && web3Instance?.constructor && hasVersionFnField(web3Instance.constructor))) {
    return undefined
  }
  return web3Instance.constructor.version
}
export function isWeb3v4(web3Instance: unknown): boolean {
  const version = getWeb3Version(web3Instance)
  if (!version) return false
  return getMajorVersion(version) === "4"
}
