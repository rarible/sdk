import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const zkatanaConfig: EthereumConfig = {
  basePath: "https://testnet-astarzkevm-api.rarible.org",
  chainId: 1261120,
  environment: "testnet",
  blockchain: Blockchain.ASTARZKEVM,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x51D04BE44865c323fDfb065d149725995dbF05f8"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: toEVMAddress("0x812afFA8f77C027C8199f9aD4472111ee4a027Dc"),
    looksrare: EVM_ZERO_ADDRESS,
    looksrareV2: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0xED2DfF3672795C89dAd8a8162026838fFd818B82"),
    erc20: toEVMAddress("0x25646B08D9796CedA5FB8CE0105a51820740C049"),
    erc721Lazy: toEVMAddress("0x1385a6B618f172d6735DE3e1E4222592f58b053B"),
    erc1155Lazy: toEVMAddress("0xB4D34a10921347877B0AA7A9DB347871b20b19F5"),
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
    erc721: toEVMAddress("0xA322E48aEB1bd02F0FA8D3efb81c5ff0A028995F"),
    erc1155: toEVMAddress("0x219E31c2FFA785ce9981C15156BA2a15b1f29562"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0xD8560C88D1DC85f9ED05b25878E366c49B68bEf9"),
  auction: EVM_ZERO_ADDRESS,
  looksrareOrderValidatorV2: EVM_ZERO_ADDRESS,
}
