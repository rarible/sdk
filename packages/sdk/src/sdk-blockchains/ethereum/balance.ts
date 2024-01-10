import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { UnionAddress } from "@rarible/types"
import type { BigNumber } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import { Blockchain } from "@rarible/api-client"
import { Action } from "@rarible/action"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { ConvertRequest } from "../../types/balances"
import type {
	DepositBiddingBalanceRequest,
	GetBiddingBalanceRequest,
	WithdrawBiddingBalanceRequest,
} from "../../types/balances"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { RequestCurrency } from "../../common/domain"
import type { IApisSdk } from "../../domain"
import { extractBlockchain } from "../../common/extract-blockchain"
import {
	convertEthereumContractAddress,
	convertToEthereumAddress,
	convertToEthereumAssetType,
	getWalletNetwork,
	isEVMBlockchain,
} from "./common"

export class EthereumBalance {
	constructor(
		private sdk: RaribleSdk,
		private wallet: Maybe<EthereumWallet>,
		private readonly apis: IApisSdk,
	) {
		this.getBalance = this.getBalance.bind(this)
		this.convert = this.convert.bind(this)
		this.getBiddingBalance = this.getBiddingBalance.bind(this)
	}

	async getBalance(address: UnionAddress, currency: RequestCurrency): Promise<BigNumber> {
		const assetType = convertToEthereumAssetType(getCurrencyAssetType(currency))
		if (assetType.assetClass !== "ETH" && assetType.assetClass !== "ERC20") {
			throw new Error("Unsupported asset type for getting balance")
		}
		const addressRaw = convertToEthereumAddress(address)
		const value = await this.sdk.balances.getBalance(addressRaw, assetType)
		return toBn(value)
	}

	async convert(request: ConvertRequest): Promise<IBlockchainTransaction> {
		const tx = await this.send(request)
		return new BlockchainEthereumTransaction(tx, await getWalletNetwork(this.wallet))
	}

	private send(request: ConvertRequest) {
		if (request.isWrap) return this.sdk.balances.deposit(request.value)
		return this.sdk.balances.withdraw(request.value)
	}

	async getBiddingBalance(request: GetBiddingBalanceRequest): Promise<BigNumber> {
		const currency = await this.getBiddingCurrency(request)
		return this.getBalance(request.walletAddress, currency)
	}

	private async getBiddingCurrency(request: GetBiddingBalanceRequest): Promise<RequestCurrency> {
		if ("currency" in request) {
			return request.currency
		} else {
			const wrappedContract = await this.sdk.balances.getWethContractAddress()
			const blockchain = extractBlockchain(request.walletAddress)
			if (isEVMBlockchain(blockchain)) {
				return {
					"@type": "ERC20",
					contract: convertEthereumContractAddress(wrappedContract, blockchain),
				}
			}
			throw new Error(`Bidding balance is not supported for ${blockchain}`)
		}
	}

	readonly depositBiddingBalance = Action
		.create({
			id: "send-tx" as const,
			run: (request: DepositBiddingBalanceRequest) =>
				this.convert({
					blockchain: Blockchain.ETHEREUM,
					isWrap: true,
					value: request.amount,
				}),
		})

	readonly withdrawBiddingBalance = Action
		.create({
			id: "send-tx" as const,
			run: (request: WithdrawBiddingBalanceRequest) =>
				this.convert({
					blockchain: Blockchain.ETHEREUM,
					isWrap: false,
					value: request.amount,
				}),
		})
}
