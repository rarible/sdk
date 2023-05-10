import type { UnionAddress } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import type { SolanaSdk } from "@rarible/solana-sdk"
import type { SolanaWallet } from "@rarible/sdk-wallet"
import type { Maybe } from "@rarible/types/build/maybe"
import type { PublicKey } from "@solana/web3.js"
import type { Order } from "@rarible/api-client"
import { Action } from "@rarible/action"
import { BlockchainSolanaTransaction } from "@rarible/sdk-transaction"
import type { RequestCurrency } from "../../common/domain"
import type { IApisSdk } from "../../domain"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import type {
	CurrencyOrOrder,
	DepositBiddingBalanceRequest,
	GetBiddingBalanceRequest,
	WithdrawBiddingBalanceRequest,
} from "../../types/balances"
import { extractPublicKey } from "./common/address-converters"
import type { ISolanaSdkConfig } from "./domain"
import { getOrderData } from "./common/order"
import { getAuctionHouse } from "./common/auction-house"

export class SolanaBalance {
	constructor(
		readonly sdk: SolanaSdk,
		readonly wallet: Maybe<SolanaWallet>,
		private readonly apis: IApisSdk,
		private readonly config: ISolanaSdkConfig | undefined,
	) {
		this.getBalance = this.getBalance.bind(this)
		this.getBiddingBalance = this.getBiddingBalance.bind(this)
		this.depositBiddingBalance = this.depositBiddingBalance.bind(this)
		this.withdrawBiddingBalance = this.withdrawBiddingBalance.bind(this)
	}

	async getBalance(address: UnionAddress, currency: RequestCurrency): Promise<BigNumberValue> {
		const assetType = getCurrencyAssetType(currency)
		if (assetType["@type"] === "SOLANA_SOL") {
			return await this.sdk.balances.getBalance(extractPublicKey(address), { commitment: "max" })
		} else if (assetType["@type"] === "SOLANA_NFT") {
			return await this.sdk.balances.getTokenBalance(
				extractPublicKey(address),
				extractPublicKey(assetType.itemId),
			)
		} else {
			throw new Error("Unsupported asset type")
		}
	}

	private async getAuctionHouse(currencyOrOrder: CurrencyOrOrder): Promise<PublicKey> {
		if ("currency" in currencyOrOrder) {
			const assetType = getCurrencyAssetType(currencyOrOrder.currency)
			if (assetType["@type"] !== "SOLANA_SOL" && assetType["@type"] !== "SOLANA_NFT") {
				throw new Error("Unsupported currency asset type (" + assetType["@type"] + ")")
			}

			return getAuctionHouse(assetType, this.config?.auctionHouseMapping)
		} else {
			let order: Order | undefined = undefined

			if ("order" in currencyOrOrder) {
				order = currencyOrOrder.order
			} else if ("orderId" in currencyOrOrder) {
				order = await this.apis.order.getOrderById({ id: currencyOrOrder.orderId })
			}

			if (order) {
				return extractPublicKey(getOrderData(order).auctionHouse!)
			} else {
				return getAuctionHouse({ "@type": "SOLANA_SOL" }, this.config?.auctionHouseMapping)
			}
		}
	}

	async getBiddingBalance(request: GetBiddingBalanceRequest): Promise<BigNumberValue> {
		if (!this.wallet) {
			throw new Error("Solana wallet not provided")
		}
		const auctionHouse = await this.getAuctionHouse(request)

		return await this.sdk.auctionHouse.getEscrowBalance({
			auctionHouse,
			signer: this.wallet!.provider,
			wallet: extractPublicKey(request.walletAddress),
		})
	}

	depositBiddingBalance = Action
		.create({
			id: "send-tx" as const,
			run: async (request: DepositBiddingBalanceRequest) => {
				if (!this.wallet) {
					throw new Error("Solana wallet not provided")
				}
				const auctionHouse = await this.getAuctionHouse(request)

				const prepare = await this.sdk.auctionHouse.depositEscrow({
					auctionHouse,
					signer: this.wallet!.provider,
					amount: request.amount,
				})

				return await prepare.submit("processed")
			},
		})
		.after(tx => new BlockchainSolanaTransaction(tx, this.sdk))

	withdrawBiddingBalance = Action
		.create({
			id: "send-tx" as const,
			run: async (request: WithdrawBiddingBalanceRequest) => {
				if (!this.wallet) {
					throw new Error("Solana wallet not provided")
				}
				const auctionHouse = await this.getAuctionHouse(request)

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
