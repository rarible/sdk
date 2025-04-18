import { toEVMAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const settlusTestnetConfig: EthereumConfig = extendConfig({
  basePath: "https://testnet-settlus-api.rarible.org",
  chainId: 5373,
  environment: "testnet",
  blockchain: Blockchain.SETTLUS,
  exchange: {
    v2: toEVMAddress("0xd786eBeD505D010D4f8127Cd825511E887c65A2A"), // ExchangeMetaV2
    wrapper: toEVMAddress("0x4e045aBF1e239BfA224c8DCb8F889C3d447D3804"), // RaribleExchangeWrapper
  },
  transferProxies: {
    nft: toEVMAddress("0xC5BBd75789bD007784A0046094d19aCeA1A79eB1"), // TransferProxy
    erc20: toEVMAddress("0x0fE65B68Eb627c21EAF3cfe8183C4F946F3d48BD"), // ERC20TransferProxy
    erc721Lazy: toEVMAddress("0xD504e84B42947Ee6f07dBE28763896EA3A2bc5e9"), // ERC721LazyMintTransferProxy
    erc1155Lazy: toEVMAddress("0xD703958825feAB56F9c7DD3906149C20416497E4"), // ERC1155LazyMintTransferProxy
  },
  factories: {
    erc721: toEVMAddress("0x7d47126a2600E22eab9eD6CF0e515678727779A6"), // ERC721RaribleFactoryC2
    erc1155: toEVMAddress("0x12B372153249F006F756d0668fCDBD8fbD8b0a15"), // ERC1155RaribleFactoryC2
  },
  weth: toEVMAddress("0x4200000000000000000000000000000000000006"),
})
