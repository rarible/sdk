import { AptosGenericSdkWallet } from "@rarible/aptos-wallet"
import { createTestAptosState } from "../common/test"
import { AptosNft } from "./nft"

describe("mint nft", () => {
  const { aptos, account } = createTestAptosState()
  const wallet = new AptosGenericSdkWallet(aptos, account)
  const mintClass = new AptosNft(aptos, wallet)

  test("mint by mintDigitalAssetTransaction function", async () => {
    const uri = "ipfs://QmWYpMyoaUGNRSQbwhw97xM8tcRWm4Et598qtzmzsau7ch/"
    const { tx, tokenAddress } = await mintClass.mintWithCollectionName({
      collectionName: "Test collection #367956",
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
      collectionAddress: "0xdbea35d52643b8f4fb500d8c89e108cc7d0df1453b5132c2934386d8fb5d795d",
      name: "Mytoken #4",
      description: "Description of Mytoken #4",
      uri,
    })
    console.log("tx", JSON.stringify(tx, null, "  "))
  })
})
