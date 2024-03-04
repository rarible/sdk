import type { Address } from "@rarible/ethereum-api-client"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { ConfigService } from "../../common/config"
import { createErc721Contract } from "../contracts/erc721"
import type { SendFunction } from "../../common/send-transaction"
import type { EthereumConfig } from "../../config/type"
import type { ApproveConfig } from "./base"
import { ApproveHandler } from "./base"
import type { ApprovableAssetType } from "./domain"

export abstract class Erc721BaseHandler<Type extends ApprovableAssetType> extends ApproveHandler<Type> {
	constructor(
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

export class Erc721Handler extends Erc721BaseHandler<"ERC721"> {
  protected getOperator = (x: EthereumConfig) => x.transferProxies.nft
  constructor(sendFn: SendFunction, configService: ConfigService) {
  	super("ERC721", sendFn, configService)
  }
}
export class Erc721LazyHandler extends Erc721BaseHandler<"ERC721_LAZY"> {
  protected getOperator = (x: EthereumConfig) => x.transferProxies.erc721Lazy
  constructor(sendFn: SendFunction, configService: ConfigService) {
  	super("ERC721_LAZY", sendFn, configService)
  }
}
