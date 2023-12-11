import { toAddress, toBigNumber, toBinary, ZERO_WORD } from "@rarible/types"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { EthErc721AssetType, EthErc1155AssetType, UnionAddress } from "@rarible/api-client"
import { convertToEVMAddress } from "@rarible/sdk-common"
import { getRequiredWallet } from "../../../common/get-required-wallet"
import { waitTx } from "../../../common/wait-tx"
import { approveErc721 } from "../../approve-erc721"
import type { SendFunction } from "../../../common/send-transaction"
import { EIP712_ORDER_TYPES } from "../../eip712"
import type { SimpleLooksrareOrder } from "../../types"
import { createUnionAddressWithChainId } from "../../../common/union-converters"
import { convertDateNumberToISO } from "../../../common"
import type { MakerOrder, SupportedChainId } from "./types"
import { addressesByNetwork } from "./constants"

export async function makeSellOrder(
	ethereum: Ethereum,
	assetType: EthErc721AssetType | EthErc1155AssetType,
	send: SendFunction,
	exchangeAddress: UnionAddress
) {
	const provider = getRequiredWallet(ethereum)
	const signerAddress = toAddress(await provider.getFrom())
	const chainId = await provider.getChainId()
	const addresses = addressesByNetwork[chainId as SupportedChainId]
	const nonce = await (provider as any).config.web3.eth.getTransactionCount(await provider.getFrom(), "pending")

	const now = Math.floor(Date.now() / 1000)

	const minNetPriceRatio = 7500

	const makerOrder: MakerOrder = {
		isOrderAsk: true,
		signer: signerAddress,
		collection: assetType.contract,
		price: "1000",
		tokenId: assetType.tokenId,
		amount: "1",
		strategy: addresses.STRATEGY_STANDARD_SALE,
		currency: addresses.WETH,
		nonce: nonce,
		startTime: now,
		endTime: now + 86400,
		minPercentageToAsk: minNetPriceRatio,
		params: [],
	}

	await waitTx(
		approveErc721(provider, send, assetType.contract, signerAddress, toAddress(addresses.TRANSFER_MANAGER_ERC721))
	)
	return {
		...makerOrder,
		signature: await getOrderSignature(makerOrder, ethereum, exchangeAddress),
	}
}

export async function makeRaribleSellOrder(
	ethereum: Ethereum,
	assetType: EthErc721AssetType | EthErc1155AssetType,
	send: SendFunction,
	exchangeAddress: UnionAddress
): Promise<SimpleLooksrareOrder> {
	const order = await makeSellOrder(ethereum, assetType, send, exchangeAddress)

	return {
		maker: createUnionAddressWithChainId(await ethereum.getChainId(), order.signer),
		make: {
			type: assetType,
			value: toBigNumber(order.amount.toString()),
		},
		take: {
			type: { "@type": "ETH" },
			value: toBigNumber(order.price.toString()),
		},
		salt: ZERO_WORD,
		startedAt: convertDateNumberToISO(+order.startTime.toString()),
		endedAt: convertDateNumberToISO(+order.endTime.toString()),
		data: {
			"@type": "ETH_LOOKSRARE_ORDER_DATA_V1",
			minPercentageToAsk: parseInt(order.minPercentageToAsk.toString()),
			strategy: createUnionAddressWithChainId(await ethereum.getChainId(), order.strategy),
			nonce: parseInt(order.nonce.toString()),
		},
		signature: toBinary(order.signature),
	}
}

async function getOrderSignature(
	order: MakerOrder, ethereum: Ethereum, exchangeContract: UnionAddress
): Promise<string> {
	const provider = getRequiredWallet(ethereum)

	if (!exchangeContract) {
		throw new Error("Looksrare order cannot be signed without exchange address in config")
	}

	const domain = {
		name: "LooksRareExchange",
		version: "1",
		chainId: await ethereum.getChainId(),
		verifyingContract: convertToEVMAddress(exchangeContract),
	}

	const type = {
		MakerOrder: [
			{ name: "isOrderAsk", type: "bool" },
			{ name: "signer", type: "address" },
			{ name: "collection", type: "address" },
			{ name: "price", type: "uint256" },
			{ name: "tokenId", type: "uint256" },
			{ name: "amount", type: "uint256" },
			{ name: "strategy", type: "address" },
			{ name: "currency", type: "address" },
			{ name: "nonce", type: "uint256" },
			{ name: "startTime", type: "uint256" },
			{ name: "endTime", type: "uint256" },
			{ name: "minPercentageToAsk", type: "uint256" },
			{ name: "params", type: "bytes" },
		],
	}

	const signature = await provider.signTypedData({
		primaryType: "MakerOrder",
		domain,
		types: {
			...EIP712_ORDER_TYPES,
			...type,
		},
		message: {
			isOrderAsk: order.isOrderAsk,
			signer: order.signer,
			collection: order.collection,
			price: order.price,
			tokenId: order.tokenId,
			amount: order.amount,
			strategy: order.strategy,
			currency: order.currency,
			nonce: order.nonce,
			startTime: order.startTime,
			endTime: order.endTime,
			minPercentageToAsk: order.minPercentageToAsk,
			params: order.params,
		},
	})
	return signature
}
