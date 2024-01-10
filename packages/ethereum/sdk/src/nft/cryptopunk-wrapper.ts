import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum } from "@rarible/ethereum-provider"
import { ZERO_ADDRESS } from "@rarible/types"
import type { SendFunction } from "../common/send-transaction"
import type { GetConfigByChainId } from "../config"
import { createCryptoPunksWrapperContract } from "./contracts/cryptoPunks/cryptopunk-wrapper"
import { createCryptoPunksMarketContract } from "./contracts/cryptoPunks"

export async function approveForWrapper(
	ethereum: Maybe<Ethereum>,
	send: SendFunction,
	getConfig: GetConfigByChainId,
	punkIndex: number
): Promise<EthereumTransaction | null> {
	if (!ethereum) {
		throw new Error("Wallet undefined")
	}
	const config = await getConfig()

	if (config.cryptoPunks.wrapperContract === ZERO_ADDRESS) {
		throw new Error("Wrapper contract address is not defined")
	}

	const marketContract = createCryptoPunksMarketContract(
		ethereum,
		config.cryptoPunks.marketContract
	)

	const saleState = await marketContract.functionCall(
		"punksOfferedForSale",
		punkIndex
	).call()

	if (
		!saleState.isForSale ||
		saleState.onlySellTo?.toLowerCase() !== config.cryptoPunks.wrapperContract.toLowerCase() ||
		saleState.minValue !== "0"
	) {
		return send(marketContract.functionCall(
			"offerPunkForSaleToAddress",
			punkIndex,
			0,
			config.cryptoPunks.wrapperContract
		))
	}

	return null
}

export async function wrapPunk(
	ethereum: Maybe<Ethereum>,
	send: SendFunction,
	getConfig: GetConfigByChainId,
	punkIndex: number
): Promise<EthereumTransaction> {
	if (!ethereum) {
		throw new Error("Wallet undefined")
	}
	const config = await getConfig()

	const wrapperContract = createCryptoPunksWrapperContract(
		ethereum,
		config.cryptoPunks.wrapperContract
	)

	return send(wrapperContract.functionCall("wrap", punkIndex))
}

export async function unwrapPunk(
	ethereum: Maybe<Ethereum>,
	send: SendFunction,
	getConfig: GetConfigByChainId,
	punkIndex: number
): Promise<EthereumTransaction> {
	if (!ethereum) {
		throw new Error("Wallet undefined")
	}
	const config = await getConfig()
	const wrapperContract = createCryptoPunksWrapperContract(
		ethereum,
		config.cryptoPunks.wrapperContract
	)

	return send(wrapperContract.functionCall("unwrap", punkIndex))
}
