import type { AbstractConnectionProvider, ConnectionProvider } from "@rarible/connector"
import { AptosWallet } from "@rarible/sdk-wallet"
import { AptosSdkWallet } from "@rarible/aptos-wallet"
import type { AptosProviderConnectionResult } from "@rarible/connector-aptos/src/domain"
import { Blockchain } from "@rarible/api-client"
import type { IWalletAndAddress } from "./wallet-connection"

export function mapAptosWallet<O>(
  provider: AbstractConnectionProvider<O, AptosProviderConnectionResult>,
): ConnectionProvider<O, IWalletAndAddress> {
  return provider.map(state => {
    return {
      wallet: new AptosWallet(new AptosSdkWallet(state.provider)),
      address: state.address,
      blockchain: Blockchain.APTOS,
    }
  })
}
