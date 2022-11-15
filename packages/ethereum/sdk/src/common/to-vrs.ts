import { ZERO_WORD } from "@rarible/types"

export function toVrs(sig: string) {
	const sig0 = sig.startsWith("0x") ? sig.substring(2) : sig
	const r = "0x" + (sig0.substring(0, 64) || ZERO_WORD.substring(2))
	const s = "0x" + (sig0.substring(64, 128) || ZERO_WORD.substring(2))
	let v = parseInt(sig0.substring(128, 130), 16) || 0
	return { r, v: v < 27 ? v + 27 : v, s }
}
