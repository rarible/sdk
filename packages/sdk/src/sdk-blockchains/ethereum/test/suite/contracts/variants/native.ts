import type { CurrencyId, EthEthereumAssetType } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import { getPromiEventReceiptPromise } from "@rarible/web3-ethereum/build/utils/to-promises"
import type { Address } from "@rarible/types"
import { toCurrencyId, ZERO_ADDRESS } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import type { EVMSuiteProvider, EVMSuiteSupportedBlockchain } from "../../domain"
import { EVMAddressful } from "./base"

export class EVMNativeToken<T extends EVMSuiteSupportedBlockchain> extends EVMAddressful<T> {
	static readonly decimals = toBn(18)
	static readonly assetType: EthEthereumAssetType = { "@type": "ETH" }
	readonly currency: CurrencyId = EVMNativeToken.getCurrency(this.blockchain)

	constructor(blockchain: T, provider: EVMSuiteProvider<T>, addressString: string = ZERO_ADDRESS) {
    	super(blockchain, addressString, provider)
	}

  static getAssetType = (blockchain: EVMSuiteSupportedBlockchain = Blockchain.ETHEREUM): EthEthereumAssetType => ({
  	...EVMNativeToken.assetType,
  	blockchain,
  })

  static getCurrency = (blockchain: EVMSuiteSupportedBlockchain = Blockchain.ETHEREUM): CurrencyId =>
  	toCurrencyId(`${blockchain}:${ZERO_ADDRESS}`)


	transfer = (to: Address, valueDecimal: BigNumberValue) => {
		return this.transferWei(to, toBn(valueDecimal).multipliedBy(toBn(10).pow(EVMNativeToken.decimals)))
	}

	transferWei = async (to: Address, valueWei: BigNumberValue) => {
		const web3 = this.provider.getWeb3Instance()
		const from = await this.provider.getFrom()
		const promiEvent = web3.eth.sendTransaction({
			to,
			from,
			value: toBn(valueWei).toString(),
		})
		return getPromiEventReceiptPromise(promiEvent)
	}
}
