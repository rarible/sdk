import type { SolanaSdk } from "@rarible/solana-sdk"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SolanaWallet } from "@rarible/sdk-wallet"
import { Action } from "@rarible/action"
import type { BigNumberValue } from "@rarible/utils"
import { BlockchainSolanaTransaction } from "@rarible/sdk-transaction"
import type { PublicKey } from "@solana/web3.js"
import type {
	SolanaDepositEscrow,
	SolanaDepositEscrowRequest,
	SolanaGetEscrowBalanceRequest, SolanaWithdrawEscrow, SolanaWithdrawEscrowRequest,
} from "../../types/solana/domain"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { IApisSdk } from "../../domain"
import type { RequestCurrency } from "../../common/domain"
import { getAuctionHouse } from "./common/auction-house"
import type { ISolanaSdkConfig } from "./domain"
import { extractPublicKey } from "./common/address-converters"

export class SolanaAuctionHouse {
	constructor(
		readonly sdk: SolanaSdk,
		readonly wallet: Maybe<SolanaWallet>,
		private readonly apis: IApisSdk,
		private readonly config: ISolanaSdkConfig | undefined,
	) {
		this.getEscrowBalance = this.getEscrowBalance.bind(this)
	}

	private getAuctionHouse(currency: RequestCurrency): PublicKey {
		const assetType = getCurrencyAssetType(currency)
		if (assetType["@type"] !== "SOLANA_SOL" && assetType["@type"] !== "SOLANA_NFT") {
			throw new Error("Unsupported currency asset type (" + assetType["@type"] + ")")
		}
		return getAuctionHouse(assetType, this.config?.auctionHouseMapping)
	}

	async getEscrowBalance(request: SolanaGetEscrowBalanceRequest): Promise<BigNumberValue> {
		if (!this.wallet) {
			throw new Error("Solana wallet not provided")
		}
		const auctionHouse = this.getAuctionHouse(request.currency)

		const balance = await this.sdk.auctionHouse.getEscrowBalance({
			auctionHouse,
			signer: this.wallet!.provider,
			wallet: extractPublicKey(request.address),
		})

		return balance.toString()
	}

	depositEscrow: SolanaDepositEscrow = Action
		.create({
			id: "send-tx" as const,
			run: async (request: SolanaDepositEscrowRequest) => {
				if (!this.wallet) {
					throw new Error("Solana wallet not provided")
				}
				const auctionHouse = this.getAuctionHouse(request.currency)

				const prepare = await this.sdk.auctionHouse.depositEscrow({
					auctionHouse,
					signer: this.wallet!.provider,
					amount: request.amount,
				})

				return await prepare.submit("processed")
			},
		})
		.after(tx => new BlockchainSolanaTransaction(tx, this.sdk))


	withdrawEscrow: SolanaWithdrawEscrow = Action
		.create({
			id: "send-tx" as const,
			run: async (request: SolanaWithdrawEscrowRequest) => {
				if (!this.wallet) {
					throw new Error("Solana wallet not provided")
				}
				const auctionHouse = this.getAuctionHouse(request.currency)

				const prepare = await this.sdk.auctionHouse.withdrawEscrow({
					auctionHouse,
					signer: this.wallet!.provider,
					amount: request.amount,
				})

				return await prepare.submit("processed")
			},
		})
		.after(tx => new BlockchainSolanaTransaction(tx, this.sdk))
}
