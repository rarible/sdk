import { toBn } from "@rarible/utils"
import type { WriteSetChange } from "@aptos-labs/ts-sdk"

export const APT_DIVIDER = toBn(10).pow(8)

export function isChangeBelongsToType(
	change: WriteSetChange, dataTypeFn: (dataType: string) => boolean
): boolean {
	return change.type === "write_resource" &&
    "data" in change && typeof change.data === "object" && change.data !== null &&
    "type" in change.data &&
    typeof change.data.type === "string" && dataTypeFn(change.data.type)
}
