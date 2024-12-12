import { toEVMAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const telosTestnetConfig: EthereumConfig = extendConfig({
  basePath: "https://testnet-telos-api.rarible.org",
  chainId: 41,
  blockchain: Blockchain.TELOS,
  environment: "testnet",
  exchange: {
    v2: toEVMAddress("0xc4A8bF73C8E5efB8C4F2fCFc728e70DFc42F4044"),
    wrapper: toEVMAddress("0xD10aB0768eB66871E6e60e98c208ED5bd8362f19"),
  },
  transferProxies: {
    nft: toEVMAddress("0x59dbe732cB62C5D61da15Fd9F129b996A1313691"),
    erc20: toEVMAddress("0x1C558F257eb8Bb2381C2C140e8e6fd5bBab3ED51"),
    erc721Lazy: toEVMAddress("0x7bAA74C65A5a8241F5D4FaDbF343156Da4c531b8"),
    erc1155Lazy: toEVMAddress("0x8161Cf910c17C9DeA638fFd842F87385cd5f1aa6"),
  },
  factories: {
    erc721: toEVMAddress("0xdEBCC2c290f3437C405F797d2383743A73383049"),
    erc1155: toEVMAddress("0x3cB4beaac289aC699A6b6d1d6FC2363fb9e3C648"),
  },
  weth: toEVMAddress("0xae85bf723a9e74d6c663dd226996ac1b8d075aa9"),
})
