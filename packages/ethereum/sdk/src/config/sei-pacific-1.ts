import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const seiPacific1Config: EthereumConfig = {
  basePath: "https://sei-api.rarible.org",
  chainId: 1329,
  environment: "production",
  blockchain: Blockchain.SEI,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x42b8DB7aCB54B4f8690C7379Ff2Befb6caf67478"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: toEVMAddress("0x4Da5504b5FD5C5073906478B2e9B66d278aB4D2C"),
    looksrare: EVM_ZERO_ADDRESS,
    looksrareV2: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0x8dBEcA8fA7ed5424f8b8dD5945dDC62393D0a642"),
    erc20: toEVMAddress("0xb1199ECB7bdB9eE082b9535A6c08c912914CaBAC"),
    erc721Lazy: toEVMAddress("0x9f1e78A81fF684F034efBbd97cCE508dF19B4210"),
    erc1155Lazy: toEVMAddress("0x56A3A3D3DeC25526eb54C771B15159443672602A"),
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
    erc721: toEVMAddress("0x4fA35DD15183a320254fE36aE1CC7067dDAC112f"),
    erc1155: toEVMAddress("0xa008fe83286382B4D56D92A07C4E602d58AF62F1"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0xe30fedd158a2e3b13e9badaeabafc5516e95e8c7"),
  auction: EVM_ZERO_ADDRESS,
  looksrareOrderValidatorV2: EVM_ZERO_ADDRESS,
}
