import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { randomEVMAddress, toEVMAddress } from "@rarible/types"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { checkAssetType as checkAssetTypeTemplate } from "../order/check-asset-type"
import { getSendWithInjects } from "../common/send-transaction"
import { createErc721V3Collection } from "../common/mint"
import { getEthereumConfig } from "../config"
import { getApis as getApisTemplate } from "../common/apis"
import type { EthereumNetwork } from "../types"
import { DEV_PK_1 } from "../common/test/test-credentials"
import { signNft } from "./sign-nft"
import type { ERC721RequestV3 } from "./mint"
import { mint } from "./mint"
import type { TransferAsset } from "./transfer"
import { transfer } from "./transfer"
import { ERC721VersionEnum } from "./contracts/domain"
import { getErc721Contract } from "./contracts/erc721"

/**
 * @group provider/dev
 */
describe("transfer Erc721 lazy", () => {
  const { provider, wallet } = createE2eProvider(DEV_PK_1)
  const web3 = new Web3(provider)
  const ethereum = new Web3Ethereum({ web3 })

  const env: EthereumNetwork = "dev-ethereum"
  const config = getEthereumConfig(env)
  const getConfig = async () => config

  const send = getSendWithInjects()
  const getApis = getApisTemplate.bind(null, ethereum, env)
  const checkAssetType = checkAssetTypeTemplate.bind(null, getApis)
  const sign = signNft.bind(null, ethereum, getConfig)

  test("should transfer erc721 lazy token", async () => {
    const from = toEVMAddress(wallet.getAddressString())
    const recipient = randomEVMAddress()
    const contract = toEVMAddress("0x5fc5Fc8693211D29b53C2923222083a81fCEd33c")

    const request: ERC721RequestV3 = {
      uri: "ipfs://ipfs/hash",
      creators: [{ account: from, value: 10000 }],
      royalties: [],
      lazy: true,
      collection: createErc721V3Collection(contract),
    }

    const minted = await mint(ethereum, send, sign, getApis, request)

    const asset: TransferAsset = {
      tokenId: minted.tokenId,
      contract: contract,
    }

    const transferTx = await transfer(ethereum, send, checkAssetType, getApis, asset, recipient)
    await transferTx.wait()
    const erc721Lazy = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V3, contract)
    const recipientBalance = await erc721Lazy.functionCall("balanceOf", recipient).call()
    expect(recipientBalance).toEqual("1")
  })
})
