import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import { convertAuctionIdToEthereum, getEVMBlockchain, toEthereumParts } from "../common"
import type { EVMBlockchain } from "../common"
import type { IBuyoutRequest, IAuctionBuyOut } from "../../../types/auction/buy-out"

export class EthereumAuctionBuyOut {
	private readonly blockchain: EVMBlockchain

	constructor(
		private sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private network: EthereumNetwork,
	) {
		this.blockchain = getEVMBlockchain(network)
	}

	buyOut: IAuctionBuyOut = this.sdk.auction.buyOut
		.before((request: IBuyoutRequest) => {
			return {
				hash: convertAuctionIdToEthereum(request.auctionId),
				originFees: toEthereumParts(request.originFees),
			}
		})
		.after(tx => new BlockchainEthereumTransaction(tx, this.network))
}
