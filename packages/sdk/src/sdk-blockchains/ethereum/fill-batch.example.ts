import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import { toOrderId } from "@rarible/types"
import { EthereumFillBatch } from "./fill-batch"

export async function runBatch(request: string[]) {
	const sdk = new EthereumFillBatch({} as RaribleSdk, {} as EthereumWallet, "dev-ethereum")
	const { submit, preparedOrders } = await sdk.buyBatch(request.map(o => ({ orderId: toOrderId(o) })))
	const result = await submit(Object.entries(preparedOrders).map(([orderId, preparedData]) => {
		// do something with prepared data
		console.log("preparedData", preparedData)
		return {
			orderId: toOrderId(orderId),
			amount: 1,
		}
	}))

	await result.wait()
}
