import { toEVMAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const goatTestnetConfig: EthereumConfig = extendConfig({
  basePath: "https://testnet-goat-api.rarible.org",
  chainId: 48816,
  environment: "testnet",
  blockchain: Blockchain.GOAT,
  exchange: {
    v2: toEVMAddress("0x18a2553ef1aaE12d9cd158821319e26A62feE90E"), // ExchangeMetaV2
    wrapper: toEVMAddress("0x47154Bf9adAe348C77Ee6F4bda1FBfF882e34280"), // RaribleExchangeWrapper
  },
  transferProxies: {
    nft: toEVMAddress("0x6F6Cdf267F98eDF9a098864B91A114fD03623462"), // TransferProxy
    erc20: toEVMAddress("0xd786eBeD505D010D4f8127Cd825511E887c65A2A"), // ERC20TransferProxy
    erc721Lazy: toEVMAddress("0x4fEB488209d2A0A71fEef28E5fA306F15b2D5FEa"), // ERC721LazyMintTransferProxy
    erc1155Lazy: toEVMAddress("0xe10605b2026884aCc669C2A9Cd4A5ec5f5FFf494"), // ERC1155LazyMintTransferProxy
  },
  openSea: {
    metadata: id32("RARIBLE"),
  },
  factories: {
    erc721: toEVMAddress("0x2eBecaBBbe8a8C629b99aB23ed154d74CD5d4342"), // ERC721RaribleFactoryC2
    erc1155: toEVMAddress("0x4492608238eB09c7AD036e9C089538a7286B8985"), // ERC1155RaribleFactoryC2
  },
  weth: toEVMAddress("0xdea5b96593a43f3fd7c6b7d34e7e3551028d5060"),
})
