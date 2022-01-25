import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import { Action } from "@rarible/action"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import { convertAuctionIdToEthereum, getEVMBlockchain } from "../common"
import type { EVMBlockchain } from "../common"
import type { CancelAuctionRequest } from "../../../types/auction/cancel"

export class EthereumAuctionCancel {
	private readonly blockchain: EVMBlockchain

	constructor(
		private sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private network: EthereumNetwork,
	) {
		this.blockchain = getEVMBlockchain(network)
	}

	cancel = Action.create({
		id: "send-tx" as const,
		run: async (request: CancelAuctionRequest) => {
			const auctionId = convertAuctionIdToEthereum(request.auctionId)
			const tx = await this.sdk.auction.cancel(auctionId)
			return new BlockchainEthereumTransaction(tx, this.network)
		},
	})
}
