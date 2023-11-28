import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { EthCryptoPunksAssetType } from "@rarible/api-client"
import type { Maybe } from "@rarible/types/build/maybe"
import type { Address } from "@rarible/types"
import { toAddress, toBigNumber, toBinary } from "@rarible/types"
import { convertToEVMAddress } from "@rarible/sdk-common"
import type { ExchangeAddresses } from "../config/type"
import { toVrs } from "../common/to-vrs"
import { createCryptoPunksMarketContract } from "../nft/contracts/cryptoPunks"
import type { SendFunction } from "../common/send-transaction"
import type { RaribleEthereumApis } from "../common/apis"
import { getRequiredWallet } from "../common/get-required-wallet"
import {
	getUnionBlockchainFromChainId,
} from "../common/get-blockchain-from-chain-id"
import type { EthereumConfig } from "../config/type"
import { createExchangeV1Contract } from "./contracts/exchange-v1"
import { createExchangeV2Contract } from "./contracts/exchange-v2"
import { createOpenseaContract } from "./contracts/exchange-opensea-v1"
import { toStructLegacyOrderKey } from "./fill-order/rarible-v1"
import { getAtomicMatchArgAddresses, getAtomicMatchArgUints } from "./fill-order/open-sea"
import type {
	SimpleCryptoPunkOrder,
	SimpleLegacyOrder, SimpleLooksrareOrder, SimpleLooksrareV2Order,
	SimpleOpenSeaV1Order,
	SimpleOrder,
	SimpleRaribleV2Order, SimpleSeaportV1Order, SimpleX2Y2Order,
} from "./types"
import { orderToStruct } from "./sign-order"
import { convertOpenSeaOrderToDTO } from "./fill-order/open-sea-converter"
import { convertAPIOrderToSeaport } from "./fill-order/seaport-utils/convert-to-seaport-order"
import { createLooksrareExchange } from "./contracts/looksrare-exchange"
import { createX2Y2Contract } from "./contracts/exchange-x2y2-v1"
import { getSeaportContract } from "./fill-order/seaport-utils/seaport-utils"
import { createLooksrareV2Exchange } from "./contracts/looksrare-v2"
import type { CheckLazyOrderType } from "./check-lazy-order"

export async function cancel(
	checkLazyOrder: CheckLazyOrderType<SimpleOrder>,
	ethereum: Maybe<Ethereum>,
	send: SendFunction,
	config: EthereumConfig,
	checkWalletChainId: () => Promise<boolean>,
	apis: RaribleEthereumApis,
	orderToCheck: SimpleOrder,
): Promise<EthereumTransaction> {
	await checkWalletChainId()
	if (ethereum) {
		const order = await checkLazyOrder(orderToCheck)
		switch (order.data["@type"]) {
			case "ETH_RARIBLE_V1":
				return cancelLegacyOrder(ethereum, send, config.exchange.v1, order as SimpleLegacyOrder)
			case "ETH_RARIBLE_V2":
			case "ETH_RARIBLE_V2_2":
			case "ETH_RARIBLE_V2_DATA_V3_SELL":
			case "ETH_RARIBLE_V2_DATA_V3_BUY":
				return cancelV2Order(ethereum, send, config.exchange.v2, order as SimpleRaribleV2Order)
			case "ETH_OPEN_SEA_V1":
				return cancelOpenseaOrderV1(ethereum, send, order as SimpleOpenSeaV1Order)
			case "ETH_BASIC_SEAPORT_DATA_V1":
				return cancelSeaportOrder(ethereum, send, config, apis, order as SimpleSeaportV1Order)
			case "ETH_LOOKSRARE_ORDER_DATA_V1":
				return cancelLooksRareOrder(ethereum, send, config.exchange, order as SimpleLooksrareOrder)
			case "ETH_LOOKSRARE_ORDER_DATA_V2":
				return cancelLooksRareV2Order(ethereum, send, config.exchange, order as SimpleLooksrareV2Order)
			case "ETH_CRYPTO_PUNKS":
				return cancelCryptoPunksOrder(ethereum, send, order as SimpleCryptoPunkOrder)
			case "ETH_X2Y2_ORDER_DATA_V1":
				return cancelX2Y2Order(ethereum, send, config, apis, order as SimpleX2Y2Order)
			default:
				throw new Error(`Unsupported order: ${JSON.stringify(order)}`)
		}
	}
	throw new Error("Wallet undefined")
}

async function cancelLegacyOrder(ethereum: Ethereum, send: SendFunction, contract: Address, order: SimpleLegacyOrder) {
	const v1 = createExchangeV1Contract(ethereum, contract)
	return send(v1.functionCall("cancel", toStructLegacyOrderKey(order)))
}

async function cancelV2Order(ethereum: Ethereum, send: SendFunction, contract: Address, order: SimpleRaribleV2Order) {
	const v2 = createExchangeV2Contract(ethereum, contract)
	return send(v2.functionCall("cancel", orderToStruct(ethereum, order)))
}

export function cancelOpenseaOrderV1(
	ethereum: Ethereum, send: SendFunction, order: SimpleOpenSeaV1Order
) {
	const exchangeContract = createOpenseaContract(ethereum, convertToEVMAddress(order.data.exchange))

	const dto = convertOpenSeaOrderToDTO(ethereum, order)
	const makerVRS = toVrs(order.signature || "0x")

	return send(
		exchangeContract.functionCall(
			"cancelOrder_",
			getAtomicMatchArgAddresses(dto),
			getAtomicMatchArgUints(dto),
			dto.feeMethod,
			dto.side,
			dto.saleKind,
			dto.howToCall,
			dto.calldata,
			dto.replacementPattern,
			dto.staticExtradata,
			makerVRS.v,
			makerVRS.r,
			makerVRS.s,
		)
	)
}

export async function cancelX2Y2Order(
	ethereum: Ethereum,
	send: SendFunction,
	config: EthereumConfig,
	apis: RaribleEthereumApis,
	order: SimpleX2Y2Order
) {
	function decodeCancelInput(input: string) {
		return ethereum.decodeParameter(
			{
				components: [{
					name: "itemHashes",
					type: "bytes32[]",
				},
				{
					name: "deadline",
					type: "uint256",
				},
				{
					name: "v",
					type: "uint8",
				},
				{
					name: "r",
					type: "bytes32",
				},
				{
					name: "s",
					type: "bytes32",
				}],
				name: "data",
				type: "tuple",
			},
			input,
		)[0] as {
			itemHashes: string[]
			deadline: string
			// signature
			r: string
			s: string
			v: number
		}
	}

	const OP_CANCEL_OFFER = toBigNumber("3")
	const exchangeContract = createX2Y2Contract(ethereum, config.exchange.x2y2)

	const signMessage = "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
	const cancelInput = decodeCancelInput(
		(await apis.orderSignature.getInput({
			signatureInputForm: {
				"@type": "X2Y2_ORDER_CANCEL",
				orderId: order.data.orderId,
				op: OP_CANCEL_OFFER,
				caller: await ethereum.getFrom(),
				sign: await ethereum.personalSign(signMessage),
				signMessage: signMessage,
				blockchain: getUnionBlockchainFromChainId(config.chainId),
			},
		})).input
	)

	return send(exchangeContract.functionCall(
		"cancel",
		cancelInput.itemHashes,
		cancelInput.deadline,
		cancelInput.v,
		cancelInput.r,
		cancelInput.s,
	))
}

export function cancelCryptoPunksOrder(ethereum: Ethereum, send: SendFunction, order: SimpleCryptoPunkOrder) {
	if (order.make.type["@type"] === "CRYPTO_PUNKS") {
		return cancelCryptoPunkOrderByAsset(ethereum, send, "punkNoLongerForSale", order.make.type)
	} else if (order.take.type["@type"] === "CRYPTO_PUNKS") {
		return cancelCryptoPunkOrderByAsset(ethereum, send, "withdrawBidForPunk", order.take.type)
	} else {
		throw new Error("Crypto punks asset has not been found")
	}
}

export function cancelCryptoPunkOrderByAsset(
	ethereum: Ethereum, send: SendFunction, methodName: string, assetType: EthCryptoPunksAssetType
) {
	const ethContract = createCryptoPunksMarketContract(ethereum, assetType.contract)
	return send(ethContract.functionCall(methodName, assetType.tokenId))
}

export async function cancelSeaportOrder(
	ethereum: Ethereum,
	send: SendFunction,
	config: EthereumConfig,
	apis: RaribleEthereumApis,
	order: SimpleSeaportV1Order
) {
	if (!order.signature || order.signature === "0x") {
		const { input } = await apis.orderSignature.getInput({
			signatureInputForm: {
				"@type": "OPEN_SEA_ORDER_FILL",
				signature: order.id,
				blockchain: getUnionBlockchainFromChainId(config.chainId),
			},
		})
		order.signature = toBinary(input)
	}
	const orderParams = convertAPIOrderToSeaport(order).parameters
	const seaport = getSeaportContract(ethereum, toAddress(order.data.protocol))
	return send(seaport.functionCall("cancel", [orderParams]))
}

export async function cancelLooksRareOrder(
	ethereum: Ethereum,
	send: SendFunction,
	config: ExchangeAddresses,
	order: SimpleLooksrareOrder,
) {
	const provider = getRequiredWallet(ethereum)

	if (!config.looksrare) {
		throw new Error("Looksrare contract did not specified")
	}

	const contract = createLooksrareExchange(provider, config.looksrare)

	return send(
		contract.functionCall("cancelMultipleMakerOrders", [order.data.nonce])
	)
}

export async function cancelLooksRareV2Order(
	ethereum: Ethereum,
	send: SendFunction,
	config: ExchangeAddresses,
	order: SimpleLooksrareV2Order,
) {
	const provider = getRequiredWallet(ethereum)

	if (!config.looksrareV2) {
		throw new Error("Looksrare contract did not specified")
	}

	const contract = createLooksrareV2Exchange(provider, config.looksrareV2)

	return send(
		contract.functionCall("cancelOrderNonces", [order.data.orderNonce])
	)
}
