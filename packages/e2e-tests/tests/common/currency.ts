import type { RequestCurrency } from "@rarible/sdk/build/common/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { EthereumWallet, FlowWallet, SolanaWallet } from "@rarible/sdk-wallet"
import { toUnionContractAddress, toEVMAddress } from "@rarible/types"
import { getTestErc20Contract } from "@rarible/ethereum-sdk-test-common"
import { getPromiEventConfirmationPromise } from "@rarible/web3-v4-ethereum/build/utils/to-promises"
import { getWalletAddressFull } from "./wallet"
import { testsConfig } from "./config"
import { Logger } from "./logger"

export async function getCurrency(
  wallets: { seller: BlockchainWallet; buyer: BlockchainWallet },
  currency: string,
): Promise<RequestCurrency> {
  Logger.log(`Get currency for=${currency}`)
  if (wallets.seller instanceof EthereumWallet && wallets.buyer instanceof EthereumWallet) {
    if (currency === "ERC20") {
      const sellerWeb3 = (wallets.seller.ethereum as any).config.web3
      const testErc20 = getTestErc20Contract(sellerWeb3, toEVMAddress(testsConfig.variables.ETHEREUM_ERC20))
      const addressBuyer = await getWalletAddressFull(wallets.buyer)
      const addressSeller = await getWalletAddressFull(wallets.seller)
      const promiEvent = testErc20.methods.mint(addressBuyer.address, "1000000000000000000000000").send({
        from: addressSeller.address,
        gas: "200000",
      })
      await getPromiEventConfirmationPromise(promiEvent)
      return {
        "@type": "ERC20",
        contract: toUnionContractAddress(`ETHEREUM:${testsConfig.variables.ETHEREUM_ERC20}`),
      }
    }
    if (currency === "ETH") {
      return {
        "@type": "ETH",
      }
    }
    throw new Error(`Wrong currency provided=${currency}`)
  } else if (wallets.seller instanceof FlowWallet && wallets.buyer instanceof FlowWallet) {
    if (currency === "FLOW_FT") {
      return {
        "@type": "FLOW_FT",
        contract: toUnionContractAddress(`FLOW:${testsConfig.variables.FLOW_FT_CONTRACT_ADDRESS}`),
      }
    }
    throw new Error(`Wrong currency provided=${currency}`)
  } else if (wallets.seller instanceof SolanaWallet && wallets.buyer instanceof SolanaWallet) {
    if (currency === "SOLANA_SOL") {
      return {
        "@type": "SOLANA_SOL",
      }
    }
    throw new Error(`Wrong currency provided=${currency}`)
  }
  throw new Error(`Incorrect wallet provided, seller=${wallets.seller}, buyer=${wallets.buyer}`)
}
