// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import { TezosWallet } from "@rarible/sdk-wallet"
import { toOrderId } from "@rarible/types"
import { createRaribleSdk } from "../../index"

describe("fill test", () => {
	const tezos = in_memory_provider(
		"edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8",
		"https://granada.tz.functori.com",
	)
	const wallet = new TezosWallet(tezos)
	const sdk = createRaribleSdk(wallet, "dev")

	let nftContract: string = "KT1FJN62onDwGkWCyUdCw82kE7PoRm7xxJEX"
	let mtContract: string = "KT1CVupWRCmVMPPJpUxLWaM6g1V6meKU5EeG"

	test.skip("fill NFT test", async () => {
		const fillAction = await sdk.order.fill({
			// itemId: mintResult.itemId,
			orderId: toOrderId("TEZOS:101f05dcbda0a044214aca804b3029ebb74c612bff9e19adb1584af5eb72370d"),
		})

		const tx = await fillAction.submit({
			amount: 1,
			infiniteApproval: true,
		})
		await tx.wait()

	}, 1500000)

})
