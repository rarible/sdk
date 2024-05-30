import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const seiArcticConfig: EthereumConfig = {
  basePath: "https://testnet-sei-api.rarible.org",
  chainId: 713715,
  environment: "testnet",
  exchange: {
    v1: ZERO_ADDRESS,
    v2: toAddress("0x42b8DB7aCB54B4f8690C7379Ff2Befb6caf67478"),
    openseaV1: ZERO_ADDRESS,
    wrapper: toAddress("0x4Da5504b5FD5C5073906478B2e9B66d278aB4D2C"),
    looksrare: ZERO_ADDRESS,
    looksrareV2: ZERO_ADDRESS,
    x2y2: ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toAddress("0x8dBEcA8fA7ed5424f8b8dD5945dDC62393D0a642"),
    erc20: toAddress("0xb1199ECB7bdB9eE082b9535A6c08c912914CaBAC"),
    erc721Lazy: toAddress("0x9f1e78A81fF684F034efBbd97cCE508dF19B4210"),
    erc1155Lazy: toAddress("0x56A3A3D3DeC25526eb54C771B15159443672602A"),
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
    erc721: toAddress("0x4fA35DD15183a320254fE36aE1CC7067dDAC112f"),
    erc1155: toAddress("0xa008fe83286382B4D56D92A07C4E602d58AF62F1"),
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
