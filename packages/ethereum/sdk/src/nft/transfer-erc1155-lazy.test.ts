import { randomEVMAddress, toEVMAddress, toBigNumber } from "@rarible/types"
import { checkAssetType as checkAssetTypeTemplate } from "../order/check-asset-type"
import { getSendWithInjects } from "../common/send-transaction"
import { createErc1155V2Collection } from "../common/mint"
import { getEthereumConfig } from "../config"
import { getApis as getApisTemplate } from "../common/apis"
import { DEV_PK_1 } from "../common/test/test-credentials"
import { createE2eTestProvider } from "../common/test/create-test-providers"
import { signNft } from "./sign-nft"
import type { ERC1155RequestV2 } from "./mint"
import { mint, MintResponseTypeEnum } from "./mint"
import type { TransferAsset } from "./transfer"
import { transfer } from "./transfer"
import { ERC1155VersionEnum } from "./contracts/domain"
import { getErc1155Contract } from "./contracts/erc1155"

/**
 * @group provider/dev
 */
describe("transfer Erc721 lazy", () => {
  const { wallet, web3Ethereum: ethereum } = createE2eTestProvider(DEV_PK_1)

  const getApis = getApisTemplate.bind(null, ethereum, "dev-ethereum")
  const checkAssetType = checkAssetTypeTemplate.bind(null, getApis)
  const config = getEthereumConfig("dev-ethereum")
  const getConfig = async () => config

  const sign = signNft.bind(null, ethereum, getConfig)
  const send = getSendWithInjects()

  test("should transfer erc1155 lazy token", async () => {
    const recipient = randomEVMAddress()
    const contract = toEVMAddress("0x4733791eED7d0Cfe49eD855EC21dFE5D32447938")

    const request: ERC1155RequestV2 = {
      uri: "ipfs://ipfs/hash",
      creators: [{ account: toEVMAddress(wallet.getAddressString()), value: 10000 }],
      collection: createErc1155V2Collection(contract),
      royalties: [],
      supply: 100,
      lazy: true,
    }

    const minted = await mint(ethereum, send, sign, getApis, request)
    if (minted.type === MintResponseTypeEnum.ON_CHAIN) {
      await minted.transaction.wait()
    }

    const asset: TransferAsset = {
      tokenId: minted.tokenId,
      contract: contract,
    }

    const transferTx = await transfer(ethereum, send, checkAssetType, getApis, asset, recipient, toBigNumber("50"))
    await transferTx.wait()

    const erc1155Lazy = await getErc1155Contract(ethereum, ERC1155VersionEnum.ERC1155V2, contract)
    const recipientBalance = await erc1155Lazy.functionCall("balanceOf", recipient, minted.tokenId).call()
    expect(recipientBalance).toEqual("50")
  })
})
