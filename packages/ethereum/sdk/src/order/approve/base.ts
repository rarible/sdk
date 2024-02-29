import type { Address, Asset, AssetType } from "@rarible/ethereum-api-client"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { BigNumber } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import type { ConfigService } from "../../common/config"

export type ApproveConfig<Type extends AssetType> = {
	owner: Address
	asset: Type
	value: BigNumber
	infinite: boolean
}

export abstract class ApproveHandler<Type extends AssetType> {
	protected abstract check(asset: AssetType): asset is Type
	protected abstract prepare: (
		wallet: Ethereum,
		config: ApproveConfig<Type>
	) => Promise<EthereumTransaction | undefined>

	constructor(private readonly configService: ConfigService) {}

    approve = async (owner: Address, asset: Asset, infinite: boolean) => {
    	if (!this.check(asset.assetType)) {
    		throw new Error(`Unexpected asset type ${asset.assetType.assetClass}`)
    	} else {
    		const wallet = this.configService.getRequiredWallet()
    		return this.prepare(wallet, {
    			owner,
    			asset: asset.assetType,
    			value: toBn(asset.value),
    			infinite,
    		})
    	}
    }
}
