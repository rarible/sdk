import { Blockchain } from "@rarible/api-client"
import { toAddress } from "@rarible/types"
import type { EthereumConfig } from "./type"
import { extendConfig } from "./utils"

export const matchTestnetConfig: EthereumConfig = extendConfig({
  basePath: "https://testnet-match-api.rarible.org",
  chainId: 699,
  environment: "testnet",
  blockchain: Blockchain.MATCH,
  exchange: {
    v2: toAddress("0x045A51B9d4b8B113f0597F4bAB65Fe10c1F2786A"),
    wrapper: toAddress("0x06C66b78794ecd65Be3A8497561a371d66F8AbCD"),
  },
  transferProxies: {
    nft: toAddress("0xa12b63714B42ea4aB44Ca129aCC15aD441cDcF20"),
    erc20: toAddress("0xbcD37B7548c35d5bb9703F5e40a59D082876809E"),
    erc721Lazy: toAddress("0x15ceF16B61D8d87E08e129B6D4Af299a29027694"),
    erc1155Lazy: toAddress("0xBc8453F510474B8542120AE312f878BC44693Ddc"),
  },
  factories: {
    erc721: toAddress("0x5Fe44e61d9917CD6e36283d12ce4FdC5949a2823"),
    erc1155: toAddress("0x6938Bcd84F5d4388125aA80423db48a74a0584b1"),
  },
  weth: toAddress("0x0919f65ae9617a363734e04fca0682499b5ab43e"),
})
