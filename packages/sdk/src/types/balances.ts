import type { UnionAddress } from "@rarible/types"
import type { AssetType } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"

export type IGetBalance = (address: UnionAddress, assetType: AssetType) => Promise<BigNumberValue>
