import { toEVMAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const goatMainnetConfig: EthereumConfig = extendConfig({
  basePath: "https://goat-api.rarible.org",
  chainId: 2345,
  environment: "production",
  blockchain: Blockchain.GOAT,
  exchange: {
    v2: toEVMAddress("0x5faf16A85028BE138A7178B222DeC98092FEEF97"), // ExchangeMetaV2
    wrapper: toEVMAddress("0xf5c9643bE5C6925F2272ecA95De16e002D6fC83C"), // RaribleExchangeWrapper
  },
  transferProxies: {
    nft: toEVMAddress("0xF65eF65a95821A16E02973b1C2200FA58898e3c0"), // TransferProxy
    erc20: toEVMAddress("0x248B46BEB66b3078D771a9E7E5a0a0216d0d07ba"), // ERC20TransferProxy
    erc721Lazy: toEVMAddress("0xce4bf732f53A76C463aE8822be858017b02779c8"), // ERC721LazyMintTransferProxy
    erc1155Lazy: toEVMAddress("0x1CC22424f2B84791cb99c141A68CD2a44Cf35398"), // ERC1155LazyMintTransferProxy
  },
  openSea: {
    metadata: id32("RARIBLE"),
  },
  factories: {
    erc721: toEVMAddress("0xEe07D8603F4A8A72B523314D0D473a6Ce93354Fe"), // ERC721RaribleFactoryC2
    erc1155: toEVMAddress("0xdC612825cc0Ab6e2CCDf0Cb4E45D4C68D69E21b4"), // ERC1155RaribleFactoryC2
  },
  weth: toEVMAddress("0xbc10000000000000000000000000000000000000"),
})
