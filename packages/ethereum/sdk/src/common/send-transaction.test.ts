import { Configuration, NftCollectionControllerApi } from "@rarible/ethereum-api-client"
import { toEVMAddress } from "@rarible/types"
import { getApiConfig } from "../config/api-config"
import { getTokenId as getTokenIdTemplate } from "../nft/get-token-id"
import { getErc721Contract } from "../nft/contracts/erc721"
import { ERC721VersionEnum } from "../nft/contracts/domain"
import { WrongNetworkWarning } from "../order/check-chain-id"
import type { EthereumNetwork } from "../types"
import { getSendWithInjects } from "./send-transaction"
import { DEV_PK_1 } from "./test/test-credentials"
import { createE2eTestProvider } from "./test/create-test-providers"

/**
 * @group provider/dev
 */
describe("sendTransaction", () => {
  const { wallet, web3Ethereum: ethereum } = createE2eTestProvider(DEV_PK_1)
  const env: EthereumNetwork = "dev-ethereum"
  const configuration = new Configuration(getApiConfig(env))
  const collectionApi = new NftCollectionControllerApi(configuration)
  const collectionId = toEVMAddress("0x74bddd22a6b9d8fae5b2047af0e0af02c42b7dae")
  const getTokenId = getTokenIdTemplate.bind(null, collectionApi)

  test.skip("throw error if config.chainId is make a difference with chainId of wallet", async () => {
    const testErc721 = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V2, collectionId)

    const send = getSendWithInjects()
    const minter = toEVMAddress(wallet.getAddressString())
    const {
      tokenId,
      signature: { v, r, s },
    } = await getTokenId(collectionId, minter)
    const functionCall = testErc721.functionCall("mint", tokenId, v, r, s, [], "uri")
    const tx = send(functionCall)

    await expect(tx).rejects.toThrow(WrongNetworkWarning)
  })
})
