import type { UnionAddress } from "@rarible/types"
import type { AssetType } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction/src"
import type { Blockchain } from "@rarible/api-client"

export type IGetBalance = (address: UnionAddress, assetType: AssetType) => Promise<BigNumberValue>
export type IConvert = (
	blockchain: Blockchain, isWrap: boolean, value: BigNumberValue
) => Promise<IBlockchainTransaction>
