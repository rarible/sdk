import { toItemId } from "@rarible/types"
import { getAuctionHouse, getAuctionHouseFee } from "../common/auction-house"

describe("Solana Auction House registry", () => {
	const auctionHouseMapping = {
		"SOLANA_SOL": {  // native sol
			address: "DMWqgbFjtaBaTkZ2Hs2UBbECBmBi9NuTNEEHd3MYiY8R",
			baseFee: 1500,
		},
		"3PexEZ782MHJQo2wspNv3oBF44Lgd3Ph8tT9J4poCwDk": { // custom mint address
			address: "5b8aRKt9E1nAZjVVF7nkA2jJf3zeDiAPXVktT2zbxFzH",
			baseFee: 4000,
		},
	}

	test("Should return correct Auction House with no mapping", async () => {
		let ah = getAuctionHouse({ "@type": "SOLANA_SOL" })
		expect(ah.toString()).toEqual("raria47jXd4tdW6Dj7T64mgahwTjMsVaDwFxMHt9Jbp")
		expect(await getAuctionHouseFee(ah)).toEqual(250)

		ah = getAuctionHouse({
			"@type": "SOLANA_NFT",
			itemId: toItemId("SOLANA:mintmintmintmintmintyiBGnLSpookWQiwLMvFn4NFm"),
		})
		// no default ah for mints registered, return default sol ah
		expect(ah.toString()).toEqual("raria47jXd4tdW6Dj7T64mgahwTjMsVaDwFxMHt9Jbp")
	})

	test("Should return correct Auction House with mapping", async () => {
		let ah = getAuctionHouse({ "@type": "SOLANA_SOL" }, auctionHouseMapping)
		expect(ah.toString()).toEqual("DMWqgbFjtaBaTkZ2Hs2UBbECBmBi9NuTNEEHd3MYiY8R")
		const fee = await getAuctionHouseFee(ah, auctionHouseMapping)
		expect(fee).toEqual(1500)

		ah = getAuctionHouse({
			"@type": "SOLANA_NFT",
			itemId: toItemId("SOLANA:3PexEZ782MHJQo2wspNv3oBF44Lgd3Ph8tT9J4poCwDk"),
		}, auctionHouseMapping)
		// use custom ah for registered mint
		expect(ah.toString()).toEqual("5b8aRKt9E1nAZjVVF7nkA2jJf3zeDiAPXVktT2zbxFzH")
		expect(await getAuctionHouseFee(ah, auctionHouseMapping)).toEqual(4000)
	})
})
