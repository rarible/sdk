import { keccak256 } from "ethereumjs-util"
import type { Word } from "@rarible/types"
import { toWord } from "@rarible/types"

export function id(value: string): string {
  return id32(value).substring(0, 10)
}

export function id32(value: string): Word {
  return toWord(`0x${keccak256(Buffer.from(value)).toString("hex")}`)
}
