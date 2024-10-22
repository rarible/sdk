import type {
  AbstractConnectionProvider,
  ConnectionProvider,
  EthereumProviderConnectionResult,
} from "@rarible/connector"
import { Web3 as Web3v4, Web3v4Ethereum } from "@rarible/web3-v4-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import type { IWalletAndAddress } from "./wallet-connection"
import { getEvmBlockchain } from "./common"

export function mapEthereumWeb3v4Wallet<O>(
  provider: AbstractConnectionProvider<O, EthereumProviderConnectionResult>,
): ConnectionProvider<O, IWalletAndAddress> {
  return provider.map(state => {
    const blockchain = getEvmBlockchain(state.chainId)
    let web3: Web3v4 = new Web3v4(state.provider)
    web3.setConfig({ defaultTransactionType: undefined })

    return {
      wallet: new EthereumWallet(
        new Web3v4Ethereum({
          web3,
          from: state.address,
        }),
      ),
      address: state.address,
      blockchain,
    }
  })
}
