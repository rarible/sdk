import { createTestAptosState, createV1Token } from "../common/test"
import { AptosNft } from "./nft"

describe("mint nft", () => {
  const state = createTestAptosState()
  const { aptos, config, wallet } = state
  const mintClass = new AptosNft(aptos, wallet, config)

  test("mint by mintDigitalAssetTransaction function", async () => {
    const uri = "ipfs://QmWYpMyoaUGNRSQbwhw97xM8tcRWm4Et598qtzmzsau7ch/"
    const { tx, tokenAddress } = await mintClass.mintWithCollectionName({
      collectionName: "Test collection #3072715",
      name: "Mytoken #4",
      description: "Description of Mytoken #4",
      uri,
    })
    console.log("tx", JSON.stringify(tx, null, "  "))
    expect(tx).toBeTruthy()
    expect(tokenAddress).toBeTruthy()
  })

  test("mint by mintByCollectionAddress function", async () => {
    const uri = "ipfs://QmWYpMyoaUGNRSQbwhw97xM8tcRWm4Et598qtzmzsau7ch/"
    const tx = await mintClass.mintWithCollectionAddress({
      collectionAddress: "0x8aefaafd6a9801186095a0697d0a339d28e4784c1cb5a85e83f04bad5db7abc8",
      name: "Mytoken #4",
      description: "Description of Mytoken #4",
      uri,
    })
    console.log("tx", JSON.stringify(tx, null, "  "))
  })

  test("mint v1", async () => {
    const tx = await createV1Token(state)
    console.log("tx", JSON.stringify(tx, null, "  "))
  })
})
