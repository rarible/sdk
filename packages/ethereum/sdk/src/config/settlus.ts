import { toEVMAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const settlusConfig: EthereumConfig = extendConfig({
  basePath: "https://settlus-api.rarible.org",
  chainId: 5371,
  environment: "production",
  blockchain: Blockchain.SETTLUS,
  exchange: {
    v2: toEVMAddress("0x9b761A2C45daEd76Dfbcfd52d22cB930a0b41186"), // ExchangeMetaV2
    wrapper: toEVMAddress("0x24562E94332f06F1F0aEa79cAf283088F9e1B8A8"), // RaribleExchangeWrapper
  },
  transferProxies: {
    nft: toEVMAddress("0x248B46BEB66b3078D771a9E7E5a0a0216d0d07ba"), // TransferProxy
    erc20: toEVMAddress("0xce4bf732f53A76C463aE8822be858017b02779c8"), // ERC20TransferProxy
    erc721Lazy: toEVMAddress("0x1CC22424f2B84791cb99c141A68CD2a44Cf35398"), // ERC721LazyMintTransferProxy
    erc1155Lazy: toEVMAddress("0xBCE7d7fbA750B1E9e0511C67b1F38C07EbfEFE63"), // ERC1155LazyMintTransferProxy
  },
  factories: {
    erc721: toEVMAddress("0xBFb17500344bA3475d46091F5c8f1e33B31ed909"), // ERC721RaribleFactoryC2
    erc1155: toEVMAddress("0x2A47f575D410cbF487a7A88F048d2bB53009769e"), // ERC1155RaribleFactoryC2
  },
  weth: toEVMAddress("0x4200000000000000000000000000000000000006"),
})
