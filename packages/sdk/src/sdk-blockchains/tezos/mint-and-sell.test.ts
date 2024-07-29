import { toCollectionId } from "@rarible/types"
import BigNumber from "bignumber.js"
import type { RaribleSdkEnvironment } from "../../config/domain"
import { createSdk } from "../../common/test/create-sdk"
import { createTestWallet } from "./test/test-wallet"
import { getTestContract } from "./test/test-contracts"
import { TEST_PK_1, TEST_PK_2, TEST_PK_3 } from "./test/credentials"

describe.skip("test tezos mint and sell", () => {
  const env: RaribleSdkEnvironment = "testnet"

  test.concurrent("mint and sell nft with prepare", async () => {
    const sellerWallet = createTestWallet(TEST_PK_1, env)
    const sellerSdk = createSdk(sellerWallet, env)
    const nftContract: string = getTestContract(env, "nftContract")

    const mintAndSellAction = await sellerSdk.nft.mintAndSell.prepare({
      collectionId: toCollectionId(nftContract),
    })
    await mintAndSellAction.submit({
      price: new BigNumber("0.0001"),
      currency: { "@type": "XTZ" },
      uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
      supply: 1,
      lazyMint: false,
    })
  })

  test.concurrent("mint and sell nft with basic function", async () => {
    const sellerWallet = createTestWallet(TEST_PK_2, env)
    const sellerSdk = createSdk(sellerWallet, env)

    const nftContract: string = getTestContract(env, "nftContract1")
    const mintAndSellAction = await sellerSdk.nft.mintAndSell({
      collectionId: toCollectionId(nftContract),
      price: new BigNumber("0.0001"),
      currency: { "@type": "XTZ" },
      uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
    })
    await mintAndSellAction.transaction.wait()
  })

  test.concurrent("mint and sell mt with prepare", async () => {
    const sellerWallet = createTestWallet(TEST_PK_3, env)
    const sellerSdk = createSdk(sellerWallet, env)

    const mtContract: string = getTestContract(env, "mtContract")

    const mintAndSellAction = await sellerSdk.nft.mintAndSell.prepare({
      collectionId: toCollectionId(mtContract),
    })

    await mintAndSellAction.submit({
      price: new BigNumber("0.0001"),
      currency: { "@type": "XTZ" },
      uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
      supply: 1,
      lazyMint: false,
    })
  })
})
