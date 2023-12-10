import type { BigNumber } from "@rarible/types"
import { toBigNumber, ZERO_ADDRESS } from "@rarible/types"
import type { Ethereum } from "@rarible/ethereum-provider"
import { Warning } from "@rarible/logger/build"
import type { NftItemRoyalty } from "@rarible/ethereum-api-client/build/models/NftItemRoyalty"
import type { BigNumberValue } from "@rarible/utils/build/bn"
import { toBn } from "@rarible/utils/build/bn"
import { BigNumber as BigNum } from "@rarible/utils"
import { convertToEVMAddress } from "@rarible/sdk-common"
import type { AmmOrderFillRequest, OrderFillSendData } from "../types"
import type { EthereumConfig } from "../../../config/type"
import { createSudoswapRouterV1Contract } from "../../contracts/sudoswap-router-v1"
import { createSudoswapPairContract } from "../../contracts/sudoswap-pair"


export class SudoswapFill {
	static async getDirectFillData(
		ethereum: Ethereum,
		request: AmmOrderFillRequest,
		config: EthereumConfig,
	): Promise<OrderFillSendData> {
		const order = this.getOrder(request)

		let fillData: OrderFillSendData

		switch (order.make.type["@type"]) {
			case "ERC721":
				if (request.assetType) {
					throw new Warning("Remove assetType from request, because it must be captured from order")
				}
				fillData = await this.buySpecificNFTs(ethereum, request, config, [order.make.type.tokenId])
				break
			case "AMM_NFT":
				if (request.assetType) {
					const tokenIds = Array.isArray(request.assetType)
						? request.assetType.map(type => toBigNumber(type.tokenId.toString()))
						: [toBigNumber(request.assetType.tokenId.toString())]

					fillData = await this.buySpecificNFTs(ethereum, request, config, tokenIds)
				} else {
					fillData = await this.buyAnyNFTs(ethereum, request, config, request.amount)
				}
				break
			default:
				throw new Error("Unsupported asset type " + order.take.type["@type"])
		}

		return {
			functionCall: fillData.functionCall,
			options: fillData.options,
		}
	}

	static getDeadline(duration: number = 4 * 60 * 60 /* 4 hours */ ): BigNumber {
		const deadlineTimestamp = ~~(Date.now() / 1000) + duration
		return toBigNumber("0x" + deadlineTimestamp.toString(16).padStart(64, "0"))
	}

	private static getRouterContract(ethereum: Ethereum, config: EthereumConfig) {
		const { pairRouter } = config.sudoswap
		if (!pairRouter || pairRouter === ZERO_ADDRESS) {
			throw new Error("Sudoswap router contract address has not been set. Change address in config")
		}
		return createSudoswapRouterV1Contract(ethereum, pairRouter)
	}

	private static getOrder(request: AmmOrderFillRequest) {
		const order = request.order
		if (order.data["@type"] !== "ETH_SUDOSWAP_AMM_DATA_V1") {
			throw new Error("Wrong order data type " + order.data["@type"])
		}
		if (order.take.type["@type"] !== "ETH") {
			throw new Error("Sudoswap supports swaps only for ETH")
		}
		return order
	}

	private static async buySpecificNFTs(
		ethereum: Ethereum,
		request: AmmOrderFillRequest,
		config: EthereumConfig,
		tokenIds: BigNumber[]
	): Promise<OrderFillSendData> {
		const routerContract = this.getRouterContract(ethereum, config)
		const order = this.getOrder(request)
		const poolContract = createSudoswapPairContract(
			ethereum,
			convertToEVMAddress(order.data.poolAddress)
		)
		const from = await ethereum.getFrom()
		const price = await poolContract.functionCall("getBuyNFTQuote", tokenIds.length).call()
		return {
			functionCall: routerContract.functionCall(
				"swapETHForSpecificNFTs",
				[{
					pair: convertToEVMAddress(order.data.poolAddress),
					nftIds: tokenIds,
				}],
				from,
				from,
				SudoswapFill.getDeadline()
			),
			options: {
				value: price.inputAmount.toString(),
			},
		}
	}

	private static async buyAnyNFTs(
		ethereum: Ethereum,
		request: AmmOrderFillRequest,
		config: EthereumConfig,
		amount: number
	): Promise<OrderFillSendData> {
		const routerContract = this.getRouterContract(ethereum, config)
		const order = this.getOrder(request)

		const poolContract = createSudoswapPairContract(
			ethereum,
			convertToEVMAddress(order.data.poolAddress)
		)
		const price = await poolContract.functionCall("getBuyNFTQuote", amount).call()
		const from = await ethereum.getFrom()

		return {
			functionCall: routerContract.functionCall(
				"swapETHForAnyNFTs",
				[{
					pair: convertToEVMAddress(order.data.poolAddress),
					numItems: amount,
				}],
				from,
				from,
				SudoswapFill.getDeadline()
			),
			options: {
				value: price.inputAmount.toString(),
			},
		}
	}

	static getRoyaltiesAmount(royalty: NftItemRoyalty[], value: BigNumberValue) {
		const royaltiesBasisPoints = royalty.reduce((acc, item) => {
			return acc += item.value
		}, 0)
		return toBn(royaltiesBasisPoints)
			.dividedBy(10000)
			.multipliedBy(value)
			.integerValue(BigNum.ROUND_FLOOR)
	}

}
