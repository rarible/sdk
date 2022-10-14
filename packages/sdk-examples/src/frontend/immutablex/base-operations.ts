/**
 * Note: this example should be compiled with any build tool like webpack and run from browser
 */

import { createRaribleSdk } from "@rarible/sdk"
import { ImxWallet } from "@rarible/immutable-wallet"
import { ImmutableXWallet } from "@rarible/sdk-wallet"
import type { IRaribleSdk } from "@rarible/sdk/src"
import type { ItemId, OrderId, UnionAddress } from "@rarible/types"
import { toItemId } from "@rarible/types"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction/src"

async function getSdk() {
	const imxConnectorWallet = new ImxWallet("testnet")
	await imxConnectorWallet.connect()
	const wallet = new ImmutableXWallet(imxConnectorWallet)

	console.log({
		status: imxConnectorWallet.getConnectionData().status,
		address: imxConnectorWallet.getConnectionData().address,
	})

	return createRaribleSdk(wallet, "testnet")
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function burn(sdk: IRaribleSdk, itemId: ItemId) {
	const prepare = await sdk.nft.burn({
		itemId,
	})
	return await prepare.submit({
		amount: 1,
	})
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function transfer(sdk: IRaribleSdk, itemId: ItemId, receiver: UnionAddress) {
	const prepare = await sdk.nft.transfer({
		itemId,
	})
	return await prepare.submit({
		amount: 1,
		to: receiver,
	})
}

async function sell(sdk: IRaribleSdk, itemId: ItemId, price: number): Promise<OrderId> {
	const prepare = await sdk.order.sell({
		itemId,
	})
	return await prepare.submit({
		amount: 1,
		price: price,
		currency: { "@type": "ETH" },
	})
}

async function buy(sdk: IRaribleSdk, orderId: OrderId) {
	const prepare = await sdk.order.buy({
		orderId,
	})
	return await prepare.submit({
		amount: 1,
	})
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function cancel(sdk: IRaribleSdk, orderId: OrderId) {
	return sdk.order.cancel({
		orderId,
	})
}

async function run() {
	try {
		const sdk = await getSdk()
		let tx: IBlockchainTransaction

		/** burn item **/
		// tx = await burn(sdk, toItemId("IMMUTABLEX:<YOUR_COLLECTION_ID>:<YOUR_ITEM_ID>"))

		/** transfer item **/
		// tx = await transfer(
		// 	sdk,
		// 	toItemId("IMMUTABLEX:<YOUR_COLLECTION_ID>:<YOUR_ITEM_ID>"),
		// 	toUnionAddress("ETHEREUM:<ETHEREUM_ADDRESS>")
		// )

		/** create sell order **/
		const orderId = await sell(sdk, toItemId("IMMUTABLEX:<YOUR_COLLECTION_ID>:<YOUR_ITEM_ID>"), 0.001)

		/** cancel order **/
		// tx = await cancel(sdk, orderId)

		/** buy item **/
		tx = await buy(sdk, orderId)

		/** waiting for transaction **/
		if (!tx.isEmpty) {
			await tx.wait()
		}

	} catch (e: any) {
		console.error(e)
	}
}

run()
