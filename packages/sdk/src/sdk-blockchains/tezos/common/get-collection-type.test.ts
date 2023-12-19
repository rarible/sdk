import type { RaribleSdkEnvironment } from "../../../config/domain"
import { createTestWallet } from "../test/test-wallet"
import { getSdkConfig } from "../../../config"
import { getCollectionType } from "./get-collection-type"
import { getMaybeTezosProvider } from "./index"

describe("get tezos collection type", () => {

	const env: RaribleSdkEnvironment = "prod"
	const wallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
		env
	)
	const config = getSdkConfig(env)
	const provider = getMaybeTezosProvider(wallet.provider, "mainnet", config)

	test("get mt type", async () => {
		const collection = "KT18pVpRXKPY2c4U2yFEGSH3ZnhB2kL8kwXS"
		const type = await getCollectionType(provider, collection)
		expect(type).toBe("TEZOS_MT")
	})

	test("get nft type", async () => {
		const collection = "KT1RHnGekZyfjTjKN4BrhpCUA5UbByW4GWrT"
		const type = await getCollectionType(provider, collection)
		expect(type).toBe("TEZOS_NFT")
	})

	test("get asset-object mt type", async () => {
		const collection = "KT1AaaBSo5AE6Eo8fpEN5xhCD4w3kHStafxk"
		const type = await getCollectionType(provider, collection)
		expect(type).toBe("TEZOS_MT")
	})

	test("get asset-object nft type", async () => {
		const collection = "KT1RHnGekZyfjTjKN4BrhpCUA5UbByW4GWrT"
		const type = await getCollectionType(provider, collection)
		expect(type).toBe("TEZOS_NFT")
	})
})
