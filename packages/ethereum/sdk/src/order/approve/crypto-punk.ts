import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { Address } from "@rarible/ethereum-api-client"
import { toAddress } from "@rarible/types"
import type { ConfigService } from "../../common/config"
import type { SendFunction } from "../../common/send-transaction"
import { createCryptoPunksMarketContract } from "../../nft/contracts/cryptoPunks"
import type { EthereumConfig } from "../../config/type"
import type { ApproveConfig } from "./base"
import { ApproveHandler } from "./base"

export class CryptoPunkHandler extends ApproveHandler<"CRYPTO_PUNKS"> {
	protected getOperator = (config: EthereumConfig) => config.transferProxies.cryptoPunks
	constructor(
		private readonly sendFn: SendFunction,
		configService: ConfigService,
	) {
		super("CRYPTO_PUNKS", configService)
	}

  protected prepare = async (
  	wallet: Ethereum,
  	config: ApproveConfig<"CRYPTO_PUNKS">
  ): Promise<EthereumTransaction | undefined> => {
  	const marketContract = createCryptoPunksMarketContract(wallet, config.asset.contract)
  	const allowance = await this.getAllowance(
  		wallet,
  		config.asset.contract,
  		config.asset.tokenId,
  		toAddress(await wallet.getFrom())
  	)
  	if (!allowance) {
  		return this.sendFn(
  			marketContract.functionCall(
  				"offerPunkForSaleToAddress",
  				config.asset.tokenId,
  				0,
  				config.operator,
  			)
  		)
  	}
  	return undefined
  }
  getAllowance = async (wallet: Ethereum, contract: Address, punkIndex: number, owner: Address): Promise<boolean> => {
  	const marketContract = createCryptoPunksMarketContract(wallet, contract)
  	const offer = await marketContract.functionCall("punksOfferedForSale", punkIndex).call()
  	const config = await this.configService.getCurrentConfig()
  	return offer.isForSale
      && offer.onlySellTo.toLowerCase() === this.getOperator(config).toLowerCase()
      && offer.seller.toLowerCase() === owner.toLowerCase()
      && offer.minValue === "0"
  }
}
