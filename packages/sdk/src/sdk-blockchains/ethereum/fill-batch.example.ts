import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import { toOrderId } from "@rarible/types"
import { EthereumFillBatch } from "./fill-batch"

export async function runBatch(request: string[]) {
	const sdk = new EthereumFillBatch({} as RaribleSdk, {} as EthereumWallet, "dev-ethereum")

	const preparedOrders = await Promise.all(request.map(async o => {
		const prepare = await sdk.getPrepareFillResponse({ orderId: toOrderId(o) })
		return { amount: prepare.maxAmount ? +prepare.maxAmount : 1, ...prepare }
	}))

	const result = await sdk.buyBatch(preparedOrders)
	await result.wait()
}
