import type { SimplifiedWithPrepareClassGeneral } from "../../common"
import type { IMintSimplified } from "./simplified"
import type { IMintPrepare } from "./prepare"

export type IMint = SimplifiedWithPrepareClassGeneral<IMintSimplified["mint"], IMintPrepare>
