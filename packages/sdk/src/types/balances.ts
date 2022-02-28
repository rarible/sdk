import type { UnionAddress } from "@rarible/types"
import type { AssetType } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction/src"

export type IGetBalance = (address: UnionAddress, assetType: AssetType) => Promise<BigNumberValue>
export type IConvert = (from: AssetType, to: AssetType, value: BigNumberValue) => Promise<IBlockchainTransaction>
