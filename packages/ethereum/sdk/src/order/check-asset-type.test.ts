import { toEVMAddress, toBigNumber } from "@rarible/types"
import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import { retry } from "../common/retry"
import type { ERC721RequestV3 } from "../nft/mint"
import { mint, MintResponseTypeEnum } from "../nft/mint"
import { signNft } from "../nft/sign-nft"
import { getSendWithInjects } from "../common/send-transaction"
import { createErc721V3Collection } from "../common/mint"
import { createTestProviders } from "../common/test/create-test-providers"
import type { EthereumNetwork } from "../types"
import { DEV_PK_1 } from "../common/test/test-credentials"
import { getEthereumConfig } from "../config"
import { getApis as getApisTemplate } from "../common/apis"
import { checkAssetType as checkAssetTypeTemplate } from "./check-asset-type"

const { provider, wallet } = createE2eProvider(DEV_PK_1)
const { providers } = createTestProviders(provider, wallet)
const from = toEVMAddress(wallet.getAddressString())

/**
 * @group provider/dev
 */
describe.each(providers)("check-asset-type test", ethereum => {
  const env: EthereumNetwork = "dev-ethereum"
  const e2eErc721ContractAddress = toEVMAddress("0x5fc5Fc8693211D29b53C2923222083a81fCEd33c")
  const config = getEthereumConfig(env)

  const getConfig = async () => config
  const getApis = getApisTemplate.bind(null, ethereum, env)

  const sign = signNft.bind(null, ethereum, getConfig)

  const send = getSendWithInjects()
  const checkAssetType = checkAssetTypeTemplate.bind(null, getApis)

  test("should set assetClass if type not present", async () => {
    const request: ERC721RequestV3 = {
      uri: "ipfs://ipfs/hash",
      lazy: false,
      creators: [{ account: from, value: 10000 }],
      royalties: [],
      collection: createErc721V3Collection(e2eErc721ContractAddress),
    }
    const minted = await mint(ethereum, send, sign, getApis, request)
    if (minted.type === MintResponseTypeEnum.ON_CHAIN) {
      await minted.transaction.wait()
    }

    const assetClass = await retry(10, 4000, async () => {
      const assetType = await checkAssetType({
        contract: e2eErc721ContractAddress,
        tokenId: toBigNumber(minted.tokenId),
      })
      if (assetType.assetClass !== "ERC721") {
        throw new Error("Asset type must be ERC721")
      }
      return assetType.assetClass
    })
    expect(assetClass).toEqual("ERC721")
  })

  test("should leave as is if assetClass present", async () => {
    const request: ERC721RequestV3 = {
      uri: "ipfs://ipfs/hash",
      creators: [{ account: from, value: 10000 }],
      royalties: [],
      lazy: false,
      collection: createErc721V3Collection(e2eErc721ContractAddress),
    }
    const minted = await mint(ethereum, send, sign, getApis, request)
    if (minted.type === MintResponseTypeEnum.ON_CHAIN) {
      await minted.transaction.wait()
    }

    const assetType = await checkAssetType({
      assetClass: "ERC721",
      contract: e2eErc721ContractAddress,
      tokenId: toBigNumber(minted.tokenId),
    })
    expect(assetType.assetClass).toEqual("ERC721")
  })
})
