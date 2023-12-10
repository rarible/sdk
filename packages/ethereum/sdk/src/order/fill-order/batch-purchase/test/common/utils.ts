import type { Address } from "@rarible/types"
import { toBn } from "@rarible/utils/build/bn"
import type { Asset } from "@rarible/api-client"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { Payout } from "@rarible/api-client/build/models/Payout"
import type { RaribleSdk } from "../../../../../index"
import { delay, retry } from "../../../../../common/retry"
import { createErc721V3Collection } from "../../../../../common/mint"
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
import { getTestContract } from "../../../../../common/test/test-credentials"
import type { EthereumNetwork } from "../../../../../types"
import { getEndDateAfterMonth } from "../../../../test/utils"
import { MIN_PAYMENT_VALUE_DECIMAL } from "../../../../../common/check-min-payment-value"
import { getEthUnionAddr } from "../../../../../common/test"
import { isOrderV2 } from "../../../../../common/order"
import { awaitOrder } from "../../../../test/await-order"
import { createUnionAddressWithChainId } from "../../../../../common/union-converters"

// const goerliErc721V3ContractAddress = toAddress("0x1723017329a804564bC8d215496C89eaBf1F3211")
// const devErc721V3ContractAddress = toAddress("0xf9864189fe52456345DD0055D210fD160694Dd08")

export async function mintTestErc721Token(sdk: RaribleSdk, env: EthereumNetwork) {
	const sellItem = await sdk.nft.mint({
		// collection: createErc721V3Collection(goerliErc721V3ContractAddress),
		collection: createErc721V3Collection(getTestContract(env, "erc721V3")),
		uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
		royalties: [
			{
				account: getEthUnionAddr("0x8508317a912086b921F6D2532f65e343C8140Cc8"),
				value: 1000,
			},
			{
				account: getEthUnionAddr("0xEE5DA6b5cDd5b5A22ECEB75b84C7864573EB4FeC"),
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
	env: EthereumNetwork,
	request?: {
		price?: string,
	},
) {
	const token = await mintTestErc721Token(sdk, env)
	//token
	const sellOrder = await sdk.order.sell({
		type: "DATA_V2",
		amount: 1,
		priceDecimal: toBn(request?.price ?? MIN_PAYMENT_VALUE_DECIMAL.toFixed()),
		takeAssetType: {
			"@type": "ETH",
		},
		payouts: [],
		originFees: [],
		makeAssetType: {
			"@type": "ERC721",
			contract: token.contract,
			tokenId: token.tokenId,
		},
		end: getEndDateAfterMonth(),
	})

	return await waitUntilOrderActive(sdk, sellOrder.id)
}

export async function makeSeaportOrder(
	sdk: RaribleSdk,
	ethereum: Ethereum,
	env: EthereumNetwork,
	send: SendFunction,
) {
	const token = await mintTestErc721Token(sdk, env)
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
	env: EthereumNetwork,
	send: SendFunction,
	config: EthereumConfig
) {
	const token = await mintTestErc721Token(sdk, env)

	if (!config.exchange.looksrare) {
		throw new Error(`Set looksrare contract address for ${env} env`)
	}
	const sellOrder = await makeRaribleSellOrder(
		ethereum,
		{
			"@type": "ERC721",
			contract: token.contract,
			tokenId: token.tokenId,
		},
		send,
		createUnionAddressWithChainId(config.chainId, config.exchange.looksrare)
	)

	return sellOrder
}

export async function makeAmmOrder(
	sdk: RaribleSdk,
	env: EthereumNetwork,
	ethereum: Ethereum,
	send: SendFunction,
	config: EthereumConfig
): Promise<SimpleAmmOrder> {
	const { poolAddress } = await mintTokensToNewSudoswapPool(sdk, env, ethereum, send, config.sudoswap.pairFactory, 2)
	const orderHash = "0x" + poolAddress.slice(2).padStart(64, "0")
	return await awaitOrder(sdk, orderHash) as SimpleAmmOrder
}

export function ordersToRequests(
	orders: SimpleOrder[],
	originFees?: Payout[],
	payouts?: Payout[],
): FillBatchSingleOrderRequest[] {
	return orders.map((order) => {
		if (
			!isOrderV2(order.data) &&
			order.data["@type"] !== "ETH_OPEN_SEA_V1" &&
      order.data["@type"] !== "ETH_BASIC_SEAPORT_DATA_V1" &&
      order.data["@type"] !== "ETH_LOOKSRARE_ORDER_DATA_V1" &&
      order.data["@type"] !== "ETH_LOOKSRARE_ORDER_DATA_V2" &&
      order.data["@type"] !== "ETH_SUDOSWAP_AMM_DATA_V1"
		) {
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
		const order = await sdk.apis.order.getValidatedOrderById({ id: orderHash })
		expect(order.status).toBe("ACTIVE")
		return order
	})
}

export async function checkOwnerships(sdk: RaribleSdk, chainId: number, assets: Asset[], expectedOwner: Address) {
	await Promise.all(assets.map(async (asset) => {
		await retry(20, 2000, async () => {
			if (!(
				asset.type["@type"] === "ERC721" ||
				asset.type["@type"] === "ERC721_Lazy" ||
				asset.type["@type"] === "ERC1155" ||
				asset.type["@type"] === "ERC1155_Lazy"
			)) {
				throw new Error("Not an token type")
			}

			const ownership = await sdk.apis.nftOwnership.getOwnershipsByItem({
				itemId: `${asset.type.contract}${asset.type.tokenId.toString()}`,
			})
			console.log("asset:", asset.type.contract, asset.type.tokenId.toString())
			console.log("expectedOwner:", expectedOwner)

			expect(ownership.ownerships[0].owner).toEqual(expectedOwner)
		})
	}))
}
