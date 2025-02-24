import { toEVMAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const victionTestnetConfig: EthereumConfig = extendConfig({
  basePath: "https://testnet-viction-api.rarible.org",
  chainId: 89,
  environment: "testnet",
  blockchain: Blockchain.VICTION,
  exchange: {
    v2: toEVMAddress("0xb708CB47976D253614F6b3b4E878959f208799B9"), // ExchangeMetaV2
    wrapper: toEVMAddress("0x3cB4beaac289aC699A6b6d1d6FC2363fb9e3C648"), // RaribleExchangeWrapper
  },
  transferProxies: {
    nft: toEVMAddress("0x6eE1644ae1f6023B277c686bF832d0adcD4DFd91"), // TransferProxy
    erc20: toEVMAddress("0x79B7dC2794860c7066e020a9d90f21FA0c8BEe83"), // ERC20TransferProxy
    erc721Lazy: toEVMAddress("0x0C6373B1715d4Cc02B4994b488c79772dd2aE2e0"), // ERC721LazyMintTransferProxy
    erc1155Lazy: toEVMAddress("0x18DdB853D32f2dBd11054d5C0ffB68d41D18AE50"), // ERC1155LazyMintTransferProxy
  },
  openSea: {
    metadata: id32("RARIBLE"),
  },
  factories: {
    erc721: toEVMAddress("0x397a9BAD5c7FFa1e297c3f2F3243D92E3c3B6D8a"), // ERC721RaribleFactoryC2
    erc1155: toEVMAddress("0xE7E6210560830181CccF72cB73cdeC8dDcC40969"), // ERC1155RaribleFactoryC2
  },
  weth: toEVMAddress("0xcC1141eEd15EB519b08cA38A2Ee75AB8025F0DA9"),
})
