import { bufferToHex, bufferToInt, setLengthLeft, toBuffer } from "ethereumjs-util"

export function fixSignature(sig?: string) {
  if (sig !== undefined) {
    const buf = hexToBuffer(sig)
    if (buf.length === 65) {
      const v = bufferToInt(buf.slice(64))
      if (v < 27) {
        const r = buf.slice(0, 32)
        const s = buf.slice(32, 64)
        return toRpcSig(v + 27, r, s)
      } else {
        return sig
      }
    } else {
      return sig
    }
  } else {
    return sig
  }
}

function hexToBuffer(hex: string): Buffer {
  if (hex.startsWith("0x")) {
    return Buffer.from(hex.substring(2), "hex")
  } else {
    return Buffer.from(hex, "hex")
  }
}

function toRpcSig(v: number, r: Buffer, s: Buffer) {
  return bufferToHex(Buffer.concat([setLengthLeft(r, 32), setLengthLeft(s, 32), toBuffer(v)]))
}
