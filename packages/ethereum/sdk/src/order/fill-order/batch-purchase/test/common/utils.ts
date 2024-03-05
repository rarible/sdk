import { toAddress } from "@rarible/types"
import { toBn } from "@rarible/utils/build/bn"
import type { Address, Asset, Part } from "@rarible/ethereum-api-client"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { RaribleSdk } from "../../../../../index"
import { delay, retry } from "../../../../../common/retry"
import { createErc721V3Collection } from "../../../../../common/mint"
import { isNft } from "../../../../../order/is-nft"
import { MintResponseTypeEnum } from "../../../../../nft/mint"
import type { FillBatchSingleOrderRequest } from "../../../types"
import type { SimpleAmmOrder, SimpleOrder } from "../../../../types"
import { ItemType } from "../../../seaport-utils/constants"
import { getOpenseaEthTakeData } from "../../../../test/get-opensea-take-data"
import { createSeaportOrder } from "../../../../test/order-opensea"
import type { SendFunction } from "../../../../../common/send-transaction"
import { makeRaribleSellOrder } from "../../../looksrare-utils/create-order"
import type { EthereumConfig } from "../../../../../config/type"
import { mintTokensToNewSudoswapPool } from "../../../amm/test/utils"
import { getEndDateAfterMonth } from "../../../../test/utils"
import { MIN_PAYMENT_VALUE_DECIMAL } from "../../../../../common/check-min-payment-value"

export async function mintTestToken(sdk: RaribleSdk, erc721Contract: Address) {
	const sellItem = await sdk.nft.mint({
		collection: createErc721V3Collection(erc721Contract),
		uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
		royalties: [
			{
				account: toAddress("0x8508317a912086b921F6D2532f65e343C8140Cc8"),
				value: 1000,
			},
			{
				account: toAddress("0xEE5DA6b5cDd5b5A22ECEB75b84C7864573EB4FeC"),
				value: 1000,
			},
		],
		lazy: false,
	})
	if (sellItem.type === MintResponseTypeEnum.ON_CHAIN) {
		await sellItem.transaction.wait()
	}

	return sellItem
}

export async function makeRaribleV2Order(
	sdk: RaribleSdk,
	erc721Contract: Address,
	request?: {
		price?: string,
	},
) {
	const token = await mintTestToken(sdk, erc721Contract)
	const sellOrder = await sdk.order.sell({
		type: "DATA_V2",
		amount: 1,
		priceDecimal: toBn(request?.price ?? MIN_PAYMENT_VALUE_DECIMAL.toFixed()),
		takeAssetType: {
			assetClass: "ETH",
		},
		payouts: [],
		originFees: [],
		makeAssetType: {
			assetClass: "ERC721",
			contract: token.contract,
			tokenId: token.tokenId,
		},
		end: getEndDateAfterMonth(),
	})

	return await waitUntilOrderActive(sdk, sellOrder.hash)
}

export async function makeSeaportOrder(
	sdk: RaribleSdk,
	ethereum: Ethereum,
	erc721Contract: Address,
	send: SendFunction,
) {
	const token = await mintTestToken(sdk, erc721Contract)
	await delay(10000)
	const orderHash = await retry(10, 1000, async () => {
		const make = {
			itemType: ItemType.ERC721,
			token: token.contract,
			identifier: token.tokenId,
		} as const
		const take = getOpenseaEthTakeData("10000000000")
		return await createSeaportOrder(ethereum, send, make, take)
	})
	return await waitUntilOrderActive(sdk, orderHash)
}

export async function makeLooksrareOrder(
	sdk: RaribleSdk,
	ethereum: Ethereum,
	erc721Contract: Address,
	send: SendFunction,
	config: EthereumConfig
) {
	const token = await mintTestToken(sdk, erc721Contract)

	if (!config.exchange.looksrare) {
		throw new Error(`Set looksrare contract address for ${config.chainId} network`)
	}
	const sellOrder = await makeRaribleSellOrder(
		ethereum,
		{
			assetClass: "ERC721",
			contract: token.contract,
			tokenId: token.tokenId,
		},
		send,
		toAddress(config.exchange.looksrare)
	)

	return sellOrder
}

export async function makeAmmOrder(
	sdk: RaribleSdk,
	erc721Contract: Address,
	ethereum: Ethereum,
	send: SendFunction,
	config: EthereumConfig
): Promise<SimpleAmmOrder> {
	const { poolAddress } = await mintTokensToNewSudoswapPool(
		sdk,
		erc721Contract,
		ethereum,
		send,
		config.sudoswap.pairFactory,
		2
	)
	const orderHash = "0x" + poolAddress.slice(2).padStart(64, "0")
	return await retry(20, 2000, () =>
		sdk.apis.order.getValidatedOrderByHash({ hash: orderHash })
	) as SimpleAmmOrder
}

const supportedOrderTypes = ["RARIBLE_V2", "OPEN_SEA_V1", "SEAPORT_V1", "LOOKSRARE", "AMM"] as const
type SupportedOrderType = typeof supportedOrderTypes[number]

function isSupportedOrderType(str: string): str is SupportedOrderType {
	return supportedOrderTypes.includes(str as SupportedOrderType)
}

export function ordersToRequests(
	orders: SimpleOrder[],
	originFees?: Part[],
	payouts?: Part[],
): FillBatchSingleOrderRequest[] {
	return orders.map((order) => {
		if (!isSupportedOrderType(order.type)) {
			throw new Error("Unsupported order type")
		}
		return {
			order,
			amount: order.make.value,
			originFees,
			payouts,
		} as FillBatchSingleOrderRequest
	})
}

export function waitUntilOrderActive(sdk: RaribleSdk, orderHash: string) {
	return retry(30, 2000, async () => {
		const order = await sdk.apis.order.getValidatedOrderByHash({ hash: orderHash })
		expect(order.status).toBe("ACTIVE")
		return order
	})
}

export async function checkOwnerships(sdk: RaribleSdk, assets: Asset[], expectedOwner: Address) {
	await Promise.all(assets.map(async (asset) => {
		await retry(20, 2000, async () => {
			if (!isNft(asset.assetType)) {
				throw new Error("Not an token type")
			}

			const ownership = await sdk.apis.nftOwnership.getNftOwnershipsByItem({
				contract: asset.assetType.contract,
				tokenId: asset.assetType.tokenId.toString(),
			})

			expect(ownership.ownerships[0].owner).toEqual(expectedOwner)
		})
	}))
}
