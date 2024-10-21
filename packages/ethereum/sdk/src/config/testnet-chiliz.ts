import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const chilizTestnetConfig: EthereumConfig = {
  basePath: "https://testnet-chiliz-api.rarible.org",
  chainId: 88882,
  environment: "testnet",
  blockchain: Blockchain.CHILIZ,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x4c27bE9fE53227194Ff259D8906A2A1b0479A3AA"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: toEVMAddress("0x1fD75d68F0D0F66383F011D282890BDACE221Dc2"),
    looksrare: EVM_ZERO_ADDRESS,
    looksrareV2: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0x3d1C134ece4CFA4c44AE5D37f74dEeccBceC9031"),
    erc20: toEVMAddress("0x8A42da3cfd53ff38E6551cc3a05F536428DaaE34"),
    erc721Lazy: toEVMAddress("0x615fdFC73edB58d9ef09574B5284E6E6362F7f6D"),
    erc1155Lazy: toEVMAddress("0x40785643bdD364A21aeE1d138E026e8914c98572"),
    openseaV1: EVM_ZERO_ADDRESS,
    cryptoPunks: EVM_ZERO_ADDRESS,
  },
  feeConfigUrl: FEE_CONFIG_URL,
  openSea: {
    metadata: id32("RARIBLE"),
    proxyRegistry: EVM_ZERO_ADDRESS,
    merkleValidator: EVM_ZERO_ADDRESS,
  },
  factories: {
    erc721: toEVMAddress("0xAeEfB55eD03eC5a25Fc4C84354b6C8c65Df963EA"),
    erc1155: toEVMAddress("0x7c512F690E89CF01deb04Bc68af95b1A5f7A2504"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0x678c34581db0a7808d0aC669d7025f1408C9a3C6"),
  auction: EVM_ZERO_ADDRESS,
  looksrareOrderValidatorV2: EVM_ZERO_ADDRESS,
}
