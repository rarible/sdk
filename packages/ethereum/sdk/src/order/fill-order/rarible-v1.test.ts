import { toEVMAddress, toBigNumber, toWord } from "@rarible/types"
import { awaitAll, deployTestErc721 } from "@rarible/ethereum-sdk-test-common"
import { getEthereumConfig } from "../../config"
import { retry } from "../../common/retry"
import { getSimpleSendWithInjects } from "../../common/send-transaction"
import { signOrder } from "../sign-order"
import type { SimpleLegacyOrder, SimpleOrder } from "../types"
import { getApis as getApisTemplate } from "../../common/apis"
import { DEV_PK_1, DEV_PK_2 } from "../../common/test/test-credentials"
import { sentTxConfirm } from "../../common/test"
import { createE2eTestProvider } from "../../common/test/create-test-providers"
import { OrderFiller } from "./"

describe.skip("test exchange v1 order", () => {
  const { wallet: wallet1, web3v4: web31, web3Ethereum: sellerEthereum } = createE2eTestProvider(DEV_PK_1)
  const { wallet: wallet2, web3Ethereum: buyerEthereum } = createE2eTestProvider(DEV_PK_2)

  const config = getEthereumConfig("dev-ethereum")
  const getConfig = async () => config
  const getApis = getApisTemplate.bind(null, buyerEthereum, "dev-ethereum")

  const getBaseOrderFee = async () => 0
  const send2 = getSimpleSendWithInjects()
  const filler = new OrderFiller(buyerEthereum, send2, getConfig, getApis, getBaseOrderFee, "dev-ethereum")

  const seller = toEVMAddress(wallet1.getAddressString())
  const buyer = toEVMAddress(wallet2.getAddressString())

  const it = awaitAll({
    testErc721: deployTestErc721(web31, "Test", "TST"),
  })

  const sign = signOrder.bind(null, sellerEthereum, getConfig)

  test("simple test v1", async () => {
    console.log(await buyerEthereum.getFrom())
    const tokenId = toBigNumber("1")
    await sentTxConfirm(it.testErc721.methods.mint(seller, tokenId, "url"), { from: seller })

    let order: SimpleOrder = {
      make: {
        assetType: {
          assetClass: "ERC721",
          contract: toEVMAddress(it.testErc721.options.address!),
          tokenId: toBigNumber(tokenId),
        },
        value: toBigNumber("1"),
      },
      maker: seller,
      take: {
        assetType: {
          assetClass: "ETH",
        },
        value: toBigNumber("100000"),
      },
      salt: toWord("0x000000000000000000000000000000000000000000000000000000000000000a"),
      type: "RARIBLE_V1",
      data: {
        dataType: "LEGACY",
        fee: 3,
      },
    }

    await it.testErc721.methods.setApprovalForAll(config.transferProxies.nft, true).send({ from: seller })

    const signedOrder: SimpleLegacyOrder = { ...order, signature: await sign(order) }
    await filler.buy({ order: signedOrder, amount: 1, originFee: 100 })

    const ownership = await retry(10, 4000, async () => {
      const apis = await getApis()
      const ownership = await apis.nftOwnership.getNftOwnershipById({
        ownershipId: `${it.testErc721.options.address}:${tokenId}:${buyer}`,
      })
      if (ownership.value.toString() !== "1") {
        throw new Error("Ownership value must be '1'")
      }
      return ownership
    })
    expect(ownership.value).toBe("1")
  })

  test("get transaction data", async () => {
    const tokenId = toBigNumber("1")

    let order: SimpleOrder = {
      make: {
        assetType: {
          assetClass: "ERC721",
          contract: toEVMAddress(it.testErc721.options.address!),
          tokenId: toBigNumber(tokenId),
        },
        value: toBigNumber("1"),
      },
      maker: seller,
      take: {
        assetType: {
          assetClass: "ETH",
        },
        value: toBigNumber("100000"),
      },
      salt: toWord("0x000000000000000000000000000000000000000000000000000000000000000a"),
      type: "RARIBLE_V1",
      data: {
        dataType: "LEGACY",
        fee: 3,
      },
    }

    const signedOrder: SimpleLegacyOrder = { ...order, signature: await sign(order) }
    await filler.getTransactionData({ order: signedOrder, amount: 1, originFee: 100 })
  })
})
