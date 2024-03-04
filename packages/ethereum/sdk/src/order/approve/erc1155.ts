import type { Address } from "@rarible/ethereum-api-client"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { ConfigService } from "../../common/config"
import type { SendFunction } from "../../common/send-transaction"
import { createErc1155Contract } from "../contracts/erc1155"
import type { EthereumConfig } from "../../config/type"
import type { ApproveConfig } from "./base"
import { ApproveHandler } from "./base"
import type { ApprovableAssetType } from "./domain"

export abstract class Erc1155BaseHandler<Type extends ApprovableAssetType> extends ApproveHandler<Type> {
	protected constructor(
  	type: Type,
  	private readonly sendFn: SendFunction,
  	configService: ConfigService,
	) {
  	super(type, configService)
	}

  protected prepare = async (
  	wallet: Ethereum,
  	config: ApproveConfig<Type>
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

export class Erc1155Handler extends Erc1155BaseHandler<"ERC1155"> {
  protected getOperator = (x: EthereumConfig) => x.transferProxies.nft
  constructor(sendFn: SendFunction, configService: ConfigService) {
  	super("ERC1155", sendFn, configService)
  }
}
export class Erc1155LazyHandler extends Erc1155BaseHandler<"ERC1155_LAZY"> {
  protected getOperator = (x: EthereumConfig) => x.transferProxies.erc1155Lazy
  constructor(sendFn: SendFunction, configService: ConfigService) {
  	super("ERC1155_LAZY", sendFn, configService)
  }
}
