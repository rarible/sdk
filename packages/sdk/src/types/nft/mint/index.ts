import type { IMintSimplified } from "./simplified"
import type { IMintPrepare } from "./prepare"

export type IMint = IMintSimplified["mint"] & {
	action: IMintPrepare
}
