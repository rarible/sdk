import { toContractAddress, toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { createTestWallet } from "./test/test-wallet"

describe("get balance", () => {
	const sellerWallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj"
	)
	const sellerSdk = createRaribleSdk(sellerWallet, "dev", { logs: LogsLevel.DISABLED })

	test.skip("get balance XTZ", async () => {
		const address = await sellerWallet.provider.address()
		await sellerSdk.balances.getBalance(
			toUnionAddress(`TEZOS:${address}`),
			{ "@type": "XTZ" }
		)
	})

	test.skip("get balance FT", async () => {
		const address = await sellerWallet.provider.address()
		await sellerSdk.balances.getBalance(
			toUnionAddress(`TEZOS:${address}`),
			{
				"@type": "TEZOS_FT",
				contract: toContractAddress("TEZOS:KT1Rgf9RNW7gLj7JGn98yyVM34S4St9eudMC"),
			}
		)
	})
})
