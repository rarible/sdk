import { toUnionContractAddress, toCurrencyId, toUnionAddress } from "@rarible/types"
import type { RaribleSdkEnvironment } from "../../config/domain"
import { createSdk } from "../../common/test/create-sdk"
import { createTestWallet } from "./test/test-wallet"
import { getTestContract } from "./test/test-contracts"

describe("get tezos balance", () => {
  const env: RaribleSdkEnvironment = "testnet"
  const sellerWallet = createTestWallet(
    "edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
    env,
  )
  const sellerSdk = createSdk(sellerWallet, env)

  //eur
  const fa2 = getTestContract(env, "eurTzContract")
  //uusd
  const fa12 = getTestContract(env, "fa12Contract")

  test.skip("get balance XTZ", async () => {
    const balance = await sellerSdk.balances.getBalance(toUnionAddress("TEZOS:tz1gqL7i1s578qj3NzgKmu6C5j3RdSBewGBo"), {
      "@type": "XTZ",
    })
    expect(balance.toString()).toEqual("1043.538791")
  })

  test.concurrent("get balance XTZ without wallet", async () => {
    const sellerSdk = createSdk(undefined, "testnet")
    const balance = await sellerSdk.balances.getBalance(toUnionAddress("TEZOS:tz1hnh8ET6dtP2PBQ2yj2T3ZEfMii6kEWR6N"), {
      "@type": "XTZ",
    })
    expect(balance.toString()).toEqual("1.0093")
  })

  test.concurrent("get balance XTZ without wallet with CurrencyId", async () => {
    const sellerSdk = createSdk(undefined, "testnet")
    const balance = await sellerSdk.balances.getBalance(
      toUnionAddress("TEZOS:tz1hnh8ET6dtP2PBQ2yj2T3ZEfMii6kEWR6N"),
      toCurrencyId("TEZOS:tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU"),
    )
    expect(balance.toString()).toEqual("1.0093")
  })

  test.concurrent("get balance FT", async () => {
    const balance = await sellerSdk.balances.getBalance(toUnionAddress("TEZOS:tz1hnh8ET6dtP2PBQ2yj2T3ZEfMii6kEWR6N"), {
      "@type": "TEZOS_FT",
      contract: toUnionContractAddress(fa12),
    })
    expect(balance.toString()).toEqual("0.03")
  })

  test.concurrent("get balance FT with currencyId", async () => {
    const balance = await sellerSdk.balances.getBalance(
      toUnionAddress("TEZOS:tz1hnh8ET6dtP2PBQ2yj2T3ZEfMii6kEWR6N"),
      toCurrencyId(fa2),
    )
    expect(balance.toString()).toEqual("0.03")
  })

  test.concurrent.skip("get balance FT without wallet", async () => {
    const sellerSdk = createSdk(undefined, "testnet")
    const balance = await sellerSdk.balances.getBalance(toUnionAddress("TEZOS:tz1hnh8ET6dtP2PBQ2yj2T3ZEfMii6kEWR6N"), {
      "@type": "TEZOS_FT",
      contract: toUnionContractAddress("TEZOS:KT1LJSq4mhyLtPKrncLXerwAF2Xvk7eU3KJX"),
    })
    expect(balance.toString()).toEqual("0.03")
  })
})
