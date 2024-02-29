import { createE2EProviderEmpty } from "../test/provider"
import { createTestWeb3Adapter } from "../test/provider-adapters"
import { ConfigService } from "."

describe("ConfigService", () => {
	const polygonProvider = createE2EProviderEmpty("polygon")
	const polygonAdapter = createTestWeb3Adapter(polygonProvider.provider)

	test("should return default network", async () => {
		const defaultNetwork = "mainnet" as const
		const service = new ConfigService(defaultNetwork, undefined)
		const network = await service.getCurrentNetwork()
		expect(network).toEqual(defaultNetwork)
	})

	test("should respect wallet current network", async () => {
		const defaultNetwork = "mainnet" as const
		const service = new ConfigService(defaultNetwork, polygonAdapter)
		const network = await service.getCurrentNetwork()
		expect(network).toEqual("polygon")
	})
})