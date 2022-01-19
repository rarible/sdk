import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { IStartAuctionRequest } from "../../../types/auction/domain"
import { OriginFeeSupport, PayoutsSupport } from "../../../types/order/fill/domain"
import * as common from "../common"
import { Action } from "@rarible/action";

export class StartAuction {
	constructor(
		private sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private network: EthereumNetwork,
	) {
	}

	async start(request: IStartAuctionRequest): Promise<IBlockchainTransaction> {

    const submit = Action.create({
      id: "" as const,
    })
		return {
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			supportedCurrencies: common.getSupportedCurrencies(),
      multiple: ,
      baseFee: await this.sdk.order.getBaseOrderFee(),
      submit,
		}
	}
}
