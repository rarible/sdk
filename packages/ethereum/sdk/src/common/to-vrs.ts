import { ZERO_WORD } from "@rarible/types"

export function toVrs(sig: string) {
	const sig0 = sig.startsWith("0x") ? sig.substring(2) : sig
	const r = "0x" + (sig0.substring(0, 64) || ZERO_WORD.substring(2))
	const s = "0x" + (sig0.substring(64, 128) || ZERO_WORD.substring(2))
	let v = parseInt(sig0.substring(128, 130), 16) || 0

	const recoveryParam = 1 - (v % 2)
	let byte32 = parseInt(sig0.substring(64, 66), 16)
	if (recoveryParam) {
		byte32 |= 0x80
	}
	const _vs = `${byte32.toString(16)}${sig0.substring(66, 128)}`
	const compact = `${r}${_vs}`
	return { r, v: v < 27 ? v + 27 : v, s, compact }
}
