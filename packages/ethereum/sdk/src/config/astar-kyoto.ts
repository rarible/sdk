import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const astarKyotoConfig: EthereumConfig = {
  basePath: "https://testnet-astarzkevm-api.rarible.org",
  environment: "testnet",
  blockchain: Blockchain.ASTARZKEVM,
  chainId: 1998,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x41407B447Fb5425187A9BCA3a062644EF2410F8D"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: toEVMAddress("0x6667b5ce062115651b0a6f499ac3f24A2DdFCB72"),
    looksrare: EVM_ZERO_ADDRESS,
    looksrareV2: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0xB7979d08657f37C14659dbd8b45FBA91c0780780"),
    erc20: toEVMAddress("0x6F6Cdf267F98eDF9a098864B91A114fD03623462"),
    erc721Lazy: toEVMAddress("0xd786eBeD505D010D4f8127Cd825511E887c65A2A"),
    erc1155Lazy: toEVMAddress("0x4fEB488209d2A0A71fEef28E5fA306F15b2D5FEa"),
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
    erc721: toEVMAddress("0x4e045aBF1e239BfA224c8DCb8F889C3d447D3804"),
    erc1155: toEVMAddress("0x927b8510Bf3108BF35aD6d60316C2f8dAB1BCD9A"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0x441325a0e1D5aC0d64C9cc790FcAbf9c5416a4a1"),
  auction: EVM_ZERO_ADDRESS,
}
