import type { Address, Asset, AssetType } from "@rarible/ethereum-api-client"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { BigNumber } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import type { ConfigService } from "../../common/config"
import type { AssetTypeByClass } from "../../common/asset-types/domain"
import type { EthereumConfig } from "../../config/type"
import type { ApprovableAssetType } from "./domain"

export type ApproveConfig<Type extends ApprovableAssetType> = {
	owner: Address
	operator: Address
	asset: AssetTypeByClass<Type>
	value: BigNumber
	infinite: boolean
}

export abstract class ApproveHandler<Type extends ApprovableAssetType> {
	protected abstract getOperator: (config: EthereumConfig) => Address

	protected abstract prepare: (
		wallet: Ethereum,
		config: ApproveConfig<Type>
	) => Promise<EthereumTransaction | undefined>

	constructor(private readonly type: Type, protected readonly configService: ConfigService) {}

    approve = async (owner: Address, asset: Asset, infinite: boolean) => {
    	if (!this.check(asset.assetType)) {
    		throw new Error(`Unexpected asset type ${asset.assetType.assetClass}`)
    	} else {
    		const wallet = this.configService.getRequiredWallet()
    		const config = await this.configService.getCurrentConfig()
    		const operator = this.getOperator(config)
    		return this.prepare(wallet, {
    			owner,
    			operator,
    			asset: asset.assetType,
    			value: toBn(asset.value),
    			infinite,
    		})
    	}
    }

    private check(asset: AssetType): asset is AssetTypeByClass<Type> {
    	return asset.assetClass === this.type
    }
}
