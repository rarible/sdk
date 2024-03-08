import type { IRaribleSdk, RequestCurrency } from "@rarible/sdk"
import type { BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import type { UnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { waitFor } from "../wait-for"
import type { EVMSuiteSupportedBlockchain } from "../../sdk-blockchains/ethereum/test/suite/domain"

export class BalancesTestSuite<T extends EVMSuiteSupportedBlockchain> {
	constructor(
		readonly blockchain: T,
		private readonly sdk: IRaribleSdk,
		private readonly addressUnion: UnionAddress
	) {
	}

  waitBalance = (
  	asset: RequestCurrency,
  	value: BigNumberValue,
  	address: UnionAddress = this.addressUnion,
  	interval = 8000
  ) =>
  	waitFor(
  		() => this.sdk.balances.getBalance(address, asset),
  		x => toBn(x).isEqualTo(value),
  		interval
  	)
  convertToWeth = (value: BigNumberValue) =>
  	this.sdk.balances.convert({
  		blockchain: this.blockchain,
  		isWrap: true,
  		value,
  	})

  convertFromWeth = (value: BigNumberValue) =>
  	this.sdk.balances.convert({
  		blockchain: this.blockchain,
  		isWrap: false,
  		value,
  	})

}
