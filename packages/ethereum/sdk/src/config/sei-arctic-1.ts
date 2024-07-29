import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const seiArctic1Config: EthereumConfig = {
  basePath: "https://testnet-sei-api.rarible.org",
  chainId: 713715,
  environment: "testnet",
  blockchain: Blockchain.SEI,
  exchange: {
    v1: ZERO_ADDRESS,
    v2: toAddress("0x5b96ddd3245aaC0cd97cFf6717985F3b9B01df3B"),
    openseaV1: ZERO_ADDRESS,
    wrapper: toAddress("0x0D7147461cef9Ce51B8ba63560Dc53f96E90638B"),
    looksrare: ZERO_ADDRESS,
    looksrareV2: ZERO_ADDRESS,
    x2y2: ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toAddress("0xA5707153b8AF346e17AF765235B054136eCf99EC"),
    erc20: toAddress("0xA3d49c7e2c845b792e422696FE0D9ef17a509731"),
    erc721Lazy: toAddress("0x74eBEEB6FBCf94f748f5999E14aCf3642A38e813"),
    erc1155Lazy: toAddress("0xd60D801E1E76a44f8A2E728F6d3a760626aa2cf2"),
    openseaV1: ZERO_ADDRESS,
    cryptoPunks: ZERO_ADDRESS,
  },
  feeConfigUrl: FEE_CONFIG_URL,
  openSea: {
    metadata: id32("RARIBLE"),
    proxyRegistry: ZERO_ADDRESS,
    merkleValidator: ZERO_ADDRESS,
  },
  factories: {
    erc721: toAddress("0xE5D43624116007CD79D17fB7136672A49fd33CE0"),
    erc1155: toAddress("0x6E6d179b1DCEaad5483edaCF907bf619FB35C7Eb"),
  },
  cryptoPunks: {
    marketContract: ZERO_ADDRESS,
    wrapperContract: ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: ZERO_ADDRESS,
    pairRouter: ZERO_ADDRESS,
  },
  weth: toAddress("0x57ee725beeb991c70c53f9642f36755ec6eb2139"),
  auction: ZERO_ADDRESS,
  looksrareOrderValidatorV2: ZERO_ADDRESS,
}
