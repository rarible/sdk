import { toBn } from "@rarible/utils"
import { ethereumNetworks } from "../../types"
import { ApiService } from "../apis"
import { getTestAPIKey } from "../test/test-credentials"
import { BaseFeeService, UnexpectedBaseFeeError } from "./index"

describe("BaseFeeService", () => {
	const defaultNetwork = "mainnet" as const

	describe("fromApiService", () => {
		test.each(ethereumNetworks)("get base fee for %s", async (network) => {
			jest.retryTimes(3)

			const apiService = new ApiService(undefined, network, {
				apiKey: getTestAPIKey(network),
			})
			const baseFeeService = BaseFeeService.fromApiService(apiService)
			const fee = await baseFeeService.getBaseFee(network, "RARIBLE_V2")
			expect(fee).not.toBeNaN()
		})
	})

	test("should handle unexpected value properly", async () => {
		const baseFeeService = new BaseFeeService(() => Promise.resolve(toBn("NaN")))
		await expect(baseFeeService.getBaseFee(defaultNetwork, "RARIBLE_V2"))
			.rejects
			.toThrowError(UnexpectedBaseFeeError)
	})
})
