import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const zkSyncTestnetConfig: EthereumConfig = {
  basePath: "https://testnet-zksync-api.rarible.org",
  chainId: 300,
  environment: "testnet",
  blockchain: Blockchain.ZKSYNC,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x99bD7BA01f9872f034a35DC4bC737cFaaaC11D63"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: toEVMAddress("0x0148b11891C0E30Fb36a6D646E04C7bebE7969c8"),
    looksrare: EVM_ZERO_ADDRESS,
    looksrareV2: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0x85a26E6D52239817570Ff643bA09E3AA5393A805"),
    erc20: toEVMAddress("0x43b9B5221F513031acC62dc8B9788E608B293baD"),
    erc721Lazy: toEVMAddress("0x11983886da3c379E507A874649C96D7EEd086c32"),
    erc1155Lazy: toEVMAddress("0x117c152C992e8c344Ce5a84100130cd87eF6bAE6"),
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
    erc721: toEVMAddress("0x2abC8bD09c681702e2297F11fd759d9014664B33"),
    erc1155: toEVMAddress("0xEda115D72EF1Dc96d0297278D1D241821F999927"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0xdf09a97A1CF809C335616c21c3a0EA4780F96514"),
  auction: EVM_ZERO_ADDRESS,
  looksrareOrderValidatorV2: EVM_ZERO_ADDRESS,
}
