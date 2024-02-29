import type { Address, AssetType, Erc20AssetType } from "@rarible/ethereum-api-client"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import { toBn } from "@rarible/utils/build/bn"
import { createErc20Contract } from "../contracts/erc20"
import type { ConfigService } from "../../common/config"
import type { SendFunction } from "../../common/send-transaction"
import type { ApproveConfig } from "./base"
import { ApproveHandler } from "./base"

export class Erc20Handler extends ApproveHandler<Erc20AssetType> {
	static maxApprovalValue = toBn(2).pow(256).minus(1)

	protected check(asset: AssetType): asset is Erc20AssetType {
		return asset.assetClass === "ERC20"
	}

	constructor(
		private readonly erc20Operator: Address,
		private readonly sendFn: SendFunction,
		configService: ConfigService,
	) {
		super(configService)
	}

	protected prepare = async (
		wallet: Ethereum,
		config: ApproveConfig<Erc20AssetType>
	): Promise<EthereumTransaction | undefined> => {
		const erc20Contract = createErc20Contract(wallet, config.asset.contract)
		const allowance = await this.getAllowance(wallet, config.asset.contract, config.owner)
		if (allowance.lt(config.value)) {
			const value = config.infinite ? Erc20Handler.maxApprovalValue : config.value
			return this.sendFn(erc20Contract.functionCall("approve", this.erc20Operator, value.toFixed()))
		}
		return undefined
	}

	getAllowance = async (wallet: Ethereum, contract: Address, owner: Address) => {
		const erc20 = createErc20Contract(wallet, contract)
		const allowance = await erc20.functionCall("allowance", owner, this.erc20Operator).call()
		return toBn(allowance)
	}
}
