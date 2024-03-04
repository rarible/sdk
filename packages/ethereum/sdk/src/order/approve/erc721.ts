import type { Address } from "@rarible/ethereum-api-client"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { ConfigService } from "../../common/config"
import { createErc721Contract } from "../contracts/erc721"
import type { SendFunction } from "../../common/send-transaction"
import type { EthereumConfig } from "../../config/type"
import type { ApproveConfig } from "./base"
import { ApproveHandler } from "./base"

export class Erc721Handler extends ApproveHandler<"ERC721"> {
  protected getOperator = (config: EthereumConfig) => config.transferProxies.nft
  constructor(
  	private readonly sendFn: SendFunction,
  	configService: ConfigService,
  ) {
  	super("ERC721", configService)
  }

  protected prepare = async (
  	wallet: Ethereum,
  	config: ApproveConfig<"ERC721">
  ): Promise<EthereumTransaction | undefined> => {
  	const erc721Contract = createErc721Contract(wallet, config.asset.contract)
  	const allowance = await this.getAllowance(wallet, config.asset.contract, config.owner)
  	if (!allowance) {
  		return this.sendFn(erc721Contract.functionCall("setApprovalForAll", config.operator, true))
  	}
  	return undefined
  }
  getAllowance = async (wallet: Ethereum, contract: Address, owner: Address): Promise<boolean> => {
  	const erc721 = createErc721Contract(wallet, contract)
  	const config = await this.configService.getCurrentConfig()
  	return erc721.functionCall("isApprovedForAll", owner, this.getOperator(config)).call()
  }
}
