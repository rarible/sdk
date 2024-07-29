import type Web3 from "web3"
import type { ItemId } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { getTestContract } from "@rarible/ethereum-sdk-test-common"
import { createSdk } from "../../../common/test/create-sdk"
import { convertEthereumCollectionId } from "../common"
import { MintType } from "../../../types/nft/mint/prepare"
import { awaitItemSupply } from "../../../common/test/await-item-supply"

export async function mintTestERC721(web3: Web3): Promise<ItemId> {
  const ethereum = new Web3Ethereum({ web3 })
  const ethereumWallet = new EthereumWallet(ethereum)
  const sdk = createSdk(ethereumWallet, "development")
  const collectionAddress = convertEthereumCollectionId(
    getTestContract("dev-ethereum", "erc721V3"),
    Blockchain.ETHEREUM,
  )
  const prepare = await sdk.nft.mint.prepare({
    collectionId: collectionAddress,
  })
  const response = await prepare.submit({ uri: "ipfs://1", supply: 1, lazyMint: false })
  if (response.type === MintType.ON_CHAIN) {
    await response.transaction.wait()
  }
  await awaitItemSupply(sdk, response.itemId, "1")
  return response.itemId
}
