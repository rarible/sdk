import type { Address } from "@rarible/ethereum-api-client"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import { toBn } from "@rarible/utils/build/bn"
import { createErc20Contract } from "../contracts/erc20"
import type { ConfigService } from "../../common/config"
import type { SendFunction } from "../../common/send-transaction"
import type { EthereumConfig } from "../../config/type"
import type { ApproveConfig } from "./base"
import { ApproveHandler } from "./base"

export class Erc20Handler extends ApproveHandler<"ERC20"> {
	static readonly maxApprovalValue = toBn(2).pow(256).minus(1)
	protected getOperator = (config: EthereumConfig) => config.transferProxies.erc20

	constructor(private readonly sendFn: SendFunction, configService: ConfigService) {
		super("ERC20", configService)
	}

	protected prepare = async (
		wallet: Ethereum,
		config: ApproveConfig<"ERC20">
	): Promise<EthereumTransaction | undefined> => {
		const erc20Contract = createErc20Contract(wallet, config.asset.contract)
		const allowance = await this.getAllowance(wallet, config.asset.contract, config.owner)
		if (allowance.lt(config.value)) {
			const value = config.infinite ? Erc20Handler.maxApprovalValue : config.value
			return this.sendFn(erc20Contract.functionCall("approve", config.operator, value.toFixed()))
		}
		return undefined
	}

	getAllowance = async (wallet: Ethereum, contract: Address, owner: Address) => {
		const erc20 = createErc20Contract(wallet, contract)
		const config = await this.configService.getCurrentConfig()
		const operator = this.getOperator(config)
		const allowance = await erc20.functionCall("allowance", owner, operator).call()
		return toBn(allowance)
	}
}
