import { Blockchain } from "@rarible/api-client"
import { toEVMAddress } from "@rarible/types"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const abstractTestnetConfig: EthereumConfig = extendConfig({
  basePath: "https://testnet-abstract-api.rarible.org",
  chainId: 11124,
  environment: "testnet",
  blockchain: Blockchain.ABSTRACT,
  exchange: {
    v2: toEVMAddress("0x66ea5C9485C80AaA1a453646deCE8c60Be056E60"),
    wrapper: toEVMAddress("0xb38C2f90dc854507042347D782fcdaD4228F58Fe"),
  },
  transferProxies: {
    nft: toEVMAddress("0x81D1E5383fD388DcC5111eefe8AA4FA4eA25bc86"),
    erc20: toEVMAddress("0xd65f4497Dc71558EcdB1d060bD2a253135f0cFFB"),
    erc721Lazy: toEVMAddress("0xAE43A8F9f2e9fa0772676B58B18e05Ab76d6a3d0"),
    erc1155Lazy: toEVMAddress("0xE7fE1f3D2E23F10287054aa17D13b4e474D190F1"),
  },
  factories: {
    erc721: toEVMAddress("0x43b9B5221F513031acC62dc8B9788E608B293baD"),
    erc1155: toEVMAddress("0x99bD7BA01f9872f034a35DC4bC737cFaaaC11D63"),
  },
  weth: toEVMAddress("0x740810c5cb6a562bc0f4f387dc7cfada9f3a7ebf"),
})
