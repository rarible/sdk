import type { UnionAddress } from "@rarible/api-client"
import { delay } from "@rarible/sdk-common"
import { OffRampClient } from "./off-ramp"

describe("Sardine Off Ramp test", () => {
  const clientId = "7e15bfe6-b698-49d2-a392-fd4b1855992e"
  const clientSecret = "4f361bcc-d7a2-4c44-b877-1f81938bb558"
  const client = new OffRampClient(clientId, clientSecret, "sandbox")

  afterAll(async () => {
    await delay(2000)
  })

  describe("Get Sell Link", function () {
    test("get sell link with ETH currency without user address", async () => {
      const link = await client.getSellLink({
        cryptoAmount: "0.04",
        fiatCurrency: "USD",
        assetType: {
          "@type": "ETH",
        },
      })
      expect(link.includes("network=ethereum")).toBe(true)
      expect(link.includes("asset_type=ETH")).toBe(true)
      expect(link.includes("fixed_fiat_currency=USD")).toBe(true)
      expect(link.includes("fixed_crypto_amount=0.04")).toBe(true)
    })

    test("get sell link with ETH currency", async () => {
      const link = await client.getSellLink({
        address: "ETHEREUM:0x1111111111111111111111111111111111111111" as UnionAddress,
        cryptoAmount: "0.04",
        fiatCurrency: "USD",
        assetType: {
          "@type": "ETH",
        },
      })
      expect(link.includes("network=ethereum")).toBe(true)
      expect(link.includes("asset_type=ETH")).toBe(true)
      expect(link.includes("fixed_fiat_currency=USD")).toBe(true)
      expect(link.includes("fixed_crypto_amount=0.04")).toBe(true)
      expect(link.includes("address=0x1111111111111111111111111111111111111111")).toBe(true)
    })

    test("get sell link with ERC-20 polygon token", async () => {
      const link = await client.getSellLink({
        address: "ETHEREUM:0x1111111111111111111111111111111111111111" as UnionAddress,
        cryptoAmount: "0.04",
        fiatCurrency: "USD",
        assetType: {
          "@type": "ERC20",
          contract: "POLYGON:0x34202fc549c3b7B83f9564Ab8938a29245A1Ef75",
        },
      })
      expect(link.includes("network=polygon")).toBe(true)
      expect(link.includes("asset_type=FLRNS")).toBe(true)
      expect(link.includes("fixed_fiat_currency=USD")).toBe(true)
      expect(link.includes("fixed_crypto_amount=0.04")).toBe(true)
      expect(link.includes("address=0x1111111111111111111111111111111111111111")).toBe(true)
    })
  })

  describe("Get Quotes", function () {
    test("get quotes with polygon token", async () => {
      const quotes = await client.getQuotes({
        address: "ETHEREUM:0x1111111111111111111111111111111111111111" as UnionAddress,
        cryptoAmount: "0.04",
        fiatCurrency: "USD",
        assetType: {
          "@type": "ERC20",
          contract: "POLYGON:0x34202fc549c3b7B83f9564Ab8938a29245A1Ef75",
        },
      })
      expect(quotes.total).toBeTruthy()
    })

    test("get quotes with ETH", async () => {
      const quotes = await client.getQuotes({
        address: "ETHEREUM:0x1111111111111111111111111111111111111111" as UnionAddress,
        cryptoAmount: "0.04",
        fiatCurrency: "USD",
        assetType: {
          "@type": "ETH",
        },
      })
      expect(quotes.total).toBeTruthy()
    })
  })

  describe("Get supported tokens", function () {
    test("get all tokens with asset types", async () => {
      const tokens = await client.getSupportedTokens()
      expect(tokens[0].assetType).toBeTruthy()
    })
  })

  describe("Get geo coverage", function () {
    test("get geo coverage is not empty", async () => {
      const geo = await client.getGeoCoverage()
      expect(geo[0].countryCode).toBeTruthy()
    })
  })
})
