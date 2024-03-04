import type { Address } from "@rarible/ethereum-api-client"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { ConfigService } from "../../common/config"
import type { SendFunction } from "../../common/send-transaction"
import { createErc1155Contract } from "../contracts/erc1155"
import type { EthereumConfig } from "../../config/type"
import type { ApproveConfig } from "./base"
import { ApproveHandler } from "./base"

export class Erc1155Handler extends ApproveHandler<"ERC1155"> {
  protected getOperator = (config: EthereumConfig) => config.transferProxies.nft

  constructor(
  	private readonly sendFn: SendFunction,
  	configService: ConfigService,
  ) {
  	super("ERC1155", configService)
  }

  protected prepare = async (
  	wallet: Ethereum,
  	config: ApproveConfig<"ERC1155">
  ): Promise<EthereumTransaction | undefined> => {
  	const erc1155Contract = createErc1155Contract(wallet, config.asset.contract)
  	const allowance = await this.getAllowance(wallet, config.asset.contract, config.owner)
  	if (!allowance) {
  		return this.sendFn(erc1155Contract.functionCall("setApprovalForAll", config.operator, true))
  	}
  	return undefined
  }
  getAllowance = async (wallet: Ethereum, contract: Address, owner: Address): Promise<boolean> => {
  	const erc1155 = createErc1155Contract(wallet, contract)
  	const config = await this.configService.getCurrentConfig()
  	return erc1155.functionCall("isApprovedForAll", owner, this.getOperator(config)).call()
  }
}
