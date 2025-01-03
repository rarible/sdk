import { Blockchain } from "@rarible/api-client"
import { toEVMAddress } from "@rarible/types"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const liskSepoliaConfig: EthereumConfig = extendConfig({
  basePath: "https://testnet-lisk-api.rarible.org",
  chainId: 4202,
  environment: "testnet",
  blockchain: Blockchain.LISK,
  exchange: {
    v2: toEVMAddress("0x8E705d722049cEEFd3606b15070CA8A72DC69eA4"),
    wrapper: toEVMAddress("0x45d6C2567a7F32c70e57D26E4ee89045A2F472Dc"),
  },
  transferProxies: {
    nft: toEVMAddress("0xdf9ae28B5564047D6DF0B4A44Eb81CD187BdA308"),
    erc20: toEVMAddress("0xDaC1aF2dCa52204b9d3d7b3bf967A30d5FCE8DC4"),
    erc721Lazy: toEVMAddress("0x18e6C7988F3c4C3B6EFdb69449EAE6B5eeA39e30"),
    erc1155Lazy: toEVMAddress("0xEd9Efd9f7E9E5449f57c50001E94A985E57986ca"),
  },
  factories: {
    erc721: toEVMAddress("0xae891BdB73E5B2C454d6Fe03824A86d0d440FC0e"),
    erc1155: toEVMAddress("0x573b8748B7D3204bF60836217f63b1332E123BB1"),
  },
  weth: toEVMAddress("0x4200000000000000000000000000000000000006"),
})
