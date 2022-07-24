import type { MethodWithPrepareGeneral } from "../../common"
import type { IMintSimplified } from "./simplified"
import type { IMintPrepare } from "./prepare"

export type IMint = MethodWithPrepareGeneral<IMintSimplified["mint"], IMintPrepare>
