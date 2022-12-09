import { EthereumProviderError } from "@rarible/ethereum-provider/src"
import { WalletType } from "@rarible/sdk-wallet"
import { isErrorWarning } from "./logger-overrides"

describe("logger overrides testing", () => {
	test("isErrorWarning", async () => {
		const err = new EthereumProviderError({
			data: null,
			error: {
				code: -32603,
				message: '[ethjs-query] while formatting outputs from RPC \'{"value":{"code":-32603,"data":{"code":-32000,"message":"transaction underpriced"}}}',
			},
			method: "any",
		})
		const isError = isErrorWarning(err, WalletType.ETHEREUM)
		expect(isError).toBeTruthy()
	})
})
