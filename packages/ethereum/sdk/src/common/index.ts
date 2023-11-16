import { toBn } from "@rarible/utils"

export const ETHER_IN_WEI = toBn(10).pow(18)

export function convertDateStringToNumber(date: string | undefined) {
	if (!date) return 0
	return Math.floor(new Date(date).getTime() / 1000)
}
