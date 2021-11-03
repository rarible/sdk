import { UnionAddress } from "@rarible/types"
import { AssetType } from "@rarible/api-client"
import { BigNumberValue } from "@rarible/utils"

export type IGetBalance = (address: UnionAddress, assetType: AssetType) => Promise<BigNumberValue>
