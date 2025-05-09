import { toEVMAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const zkCandyTestnetConfig: EthereumConfig = extendConfig({
  basePath: "https://testnet-zkcandy-api.rarible.org",
  chainId: 302,
  environment: "testnet",
  blockchain: Blockchain.ZKCANDY,
  exchange: {
    v2: toEVMAddress("0xEda115D72EF1Dc96d0297278D1D241821F999927"), // ExchangeMetaV2
    wrapper: toEVMAddress("0xE89c67db39f5B13b9f1F7a815E9890b94B85Ce0f"), // RaribleExchangeWrapper
  },
  transferProxies: {
    nft: toEVMAddress("0x9301194711E0015316AA0d9e0F184dFB87f70582"), // TransferProxy
    erc20: toEVMAddress("0x2abC8bD09c681702e2297F11fd759d9014664B33"), // ERC20TransferProxy
    erc721Lazy: toEVMAddress("0xA01B190820112DF741D00BcEA10e57a933B669CF"), // ERC721LazyMintTransferProxy
    erc1155Lazy: toEVMAddress("0x6C2CFaA91A1d4b92FbCB10123365084412cEe4b1"), // ERC1155LazyMintTransferProxy
  },
  factories: {
    erc721: toEVMAddress("0x192f57797bc95eF726837645efD0b75E120568e2"), // ERC721RaribleFactoryC2
    erc1155: toEVMAddress("0x5F577Dd877b0136ab7ed8A4d7b303aD38348a1Ea"), // ERC1155RaribleFactoryC2
  },
  weth: toEVMAddress("0xf26b5f55a784af396bdd6c4f86f09889c14ef2cf"),
})
