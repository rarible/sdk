import { SolanaWallet } from "@rarible/sdk-wallet"
import { toBigNumber, toItemId } from "@rarible/types"
import { toPublicKey } from "@rarible/solana-common"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { getWallet } from "./common/test/test-wallets"

describe("Solana cancel", () => {
	const wallet = getWallet(0)
	const sdk = createRaribleSdk(new SolanaWallet(wallet), "dev", { logs: LogsLevel.DISABLED })

	test("Should cancel NFT selling", async () => {
		const mint = toPublicKey("6APnUDJXkTAbT5tpKr3WeMGQ74p1QcXZjLR6erpnLM8P")
		const itemId = toItemId("SOLANA:" + mint.toString())
		const sell = await sdk.order.sell({ itemId })
		const orderId = await sell.submit({
			amount: 1,
			currency: {
				"@type": "SOLANA_SOL",
			},
			price: toBigNumber("0.001"),
		})

		const cancelTx = await sdk.order.cancel({
			orderId,

			itemId: itemId,
		} as any)

		expect(cancelTx.hash()).toBeTruthy()
		await cancelTx.wait()
		expect(cancelTx.getTxLink()).toBeTruthy()
	})
})
