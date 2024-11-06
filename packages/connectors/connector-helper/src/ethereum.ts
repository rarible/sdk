import type {
  AbstractConnectionProvider,
  ConnectionProvider,
  EthereumProviderConnectionResult,
} from "@rarible/connector"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { Web3Ethereum, Web3 } from "@rarible/web3-ethereum"
import type { IWalletAndAddress } from "./wallet-connection"
import { getEvmBlockchain } from "./common"

/**
 * Use this function for wrapping web3 v1 instance
 * If you need to use web3 v4 use "mapEthereumWeb3v4Wallet" function
 */
export function mapEthereumWallet<O>(
  provider: AbstractConnectionProvider<O, EthereumProviderConnectionResult>,
): ConnectionProvider<O, IWalletAndAddress> {
  return provider.map(state => {
    const blockchain = getEvmBlockchain(state.chainId)
    let web3: Web3 = new Web3(state.provider)

    return {
      wallet: new EthereumWallet(
        new Web3Ethereum({
          web3,
          from: state.address,
        }),
      ),
      address: state.address,
      blockchain,
    }
  })
}
