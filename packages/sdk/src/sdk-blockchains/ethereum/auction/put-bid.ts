import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import { toBigNumber } from "@rarible/types"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import { convertAuctionIdToEthereum, getEVMBlockchain, toEthereumParts } from "../common"
import type { EVMBlockchain } from "../common"
import type { IAuctionPutBid, IPutBidRequest } from "../../../types/auction/put-bid"

export class EthereumAuctionPutBid {
	private readonly blockchain: EVMBlockchain

	constructor(
		private sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private network: EthereumNetwork,
	) {
		this.blockchain = getEVMBlockchain(network)
	}

	putBid: IAuctionPutBid = this.sdk.auction.putBid
		.before((request: IPutBidRequest) => {
			return {
				auctionId: convertAuctionIdToEthereum(request.auctionId),
				priceDecimal: toBigNumber(request.price.toString()),
				originFees: toEthereumParts(request.originFees),
				payouts: toEthereumParts(request.payouts),
			}
		})
		.after(tx => new BlockchainEthereumTransaction(tx, this.network))
}
