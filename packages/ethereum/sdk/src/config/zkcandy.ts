import { toEVMAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const zkCandyConfig: EthereumConfig = extendConfig({
  basePath: "https://zkcandy-api.rarible.org",
  chainId: 320,
  environment: "production",
  blockchain: Blockchain.ZKCANDY,
  exchange: {
    v2: toEVMAddress("0x9242eD19f0978302E2CD0B973e0c4B49042aDfCE"), // ExchangeMetaV2
    wrapper: toEVMAddress("0x20FB4cBec4228a342a46536f32Ac1973D3DeABb4"), // RaribleExchangeWrapper
  },
  transferProxies: {
    nft: toEVMAddress("0x02D4207A4dD1C940C4596af255c051B94288CfD5"), // TransferProxy
    erc20: toEVMAddress("0xb6379392FFA328252c188D4a846573C5222CFB96"), // ERC20TransferProxy
    erc721Lazy: toEVMAddress("0x5d01eF93fA988c26fAfef05118Dc3384C9D25242"), // ERC721LazyMintTransferProxy
    erc1155Lazy: toEVMAddress("0xC0dc07bB699bd91ecd685a7fcF9A1b89A87CBfBC"), // ERC1155LazyMintTransferProxy
  },
  factories: {
    erc721: toEVMAddress("0xdb14d3B2b03859eC769E468d2804a432c705d691"), // ERC721RaribleFactoryC2
    erc1155: toEVMAddress("0x7Ff3d46DcaAd2C3E8bD36b62300C9C2492c3D8e7"), // ERC1155RaribleFactoryC2
  },
  weth: toEVMAddress("0x1e347256309b4764edd8d7bdf4aa4ecb62b58320"),
})
