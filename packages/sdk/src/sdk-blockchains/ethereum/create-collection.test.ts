import { Blockchain } from "@rarible/api-client"
import type { CollectionId } from "@rarible/types"
import { toCollectionId } from "@rarible/types"
import { waitFor } from "../../common/wait-for"
import { DEV_PK_1, DEV_PK_2 } from "./test/common"
import type { EVMTestSuite } from "./test/suite"
import { EVMTestSuiteFactory } from "./test/suite"

const blockchains = [Blockchain.ETHEREUM, Blockchain.POLYGON] as const

describe.each(blockchains)("create collection", blockchain => {
  const suiteFactory = new EVMTestSuiteFactory(blockchain)
  let suiteDev1: EVMTestSuite<typeof blockchain>
  let suiteDev2: EVMTestSuite<typeof blockchain>

  beforeAll(async () => {
    suiteDev1 = await suiteFactory.create(DEV_PK_1)
    suiteDev2 = await suiteFactory.create(DEV_PK_2)
  })

  afterAll(() => {
    suiteDev1.destroy()
    suiteDev2.destroy()
  })

  test(`${blockchain} create erc-721 collection`, async () => {
    const { address, tx } = await suiteDev1.sdk.nft.createCollection({
      blockchain,
      type: "ERC721",
      name: "name",
      symbol: "RARI",
      baseURI: "https://ipfs.rarible.com",
      contractURI: "https://ipfs.rarible.com",
      isPublic: true,
    })
    await tx.wait()

    const collection = toCollectionId(address)
    await waitForCollection(collection)
    await suiteDev2.items.mintAndWait(collection)
  })

  test(`${blockchain} create erc-721 private collection`, async () => {
    const { address, tx } = await suiteDev1.sdk.nft.createCollection({
      blockchain,
      type: "ERC721",
      name: "name",
      symbol: "RARI",
      baseURI: "https://ipfs.rarible.com",
      contractURI: "https://ipfs.rarible.com",
      isPublic: false,
      operators: [],
    })
    await tx.wait()

    const collection = toCollectionId(address)
    await waitForCollection(collection)
  })

  test(`${blockchain} create erc-1155 public collection`, async () => {
    const { address, tx } = await suiteDev1.sdk.nft.createCollection({
      blockchain,
      type: "ERC1155",
      name: "name",
      symbol: "RARI",
      baseURI: "https://ipfs.rarible.com",
      contractURI: "https://ipfs.rarible.com",
      isPublic: true,
    })
    await tx.wait()

    const collection = toCollectionId(address)
    await waitForCollection(collection)
    await suiteDev2.items.mintAndWait(collection)
  })

  test(`${blockchain} create erc-1155 private collection`, async () => {
    const { address } = await suiteDev1.sdk.nft.createCollection({
      blockchain,
      type: "ERC1155",
      name: "name",
      symbol: "RARI",
      baseURI: "https://ipfs.rarible.com",
      contractURI: "https://ipfs.rarible.com",
      isPublic: false,
      operators: [],
    })

    const collection = toCollectionId(address)
    await waitForCollection(collection)
  })

  async function waitForCollection(collectionId: CollectionId) {
    await waitFor(
      () => suiteDev1.sdk.apis.collection.getCollectionById({ collection: collectionId }),
      x => Boolean(x),
    )
  }
})
