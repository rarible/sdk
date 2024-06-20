import type { AbstractConnectionProvider, ConnectionProvider } from "@rarible/connector"
import { AptosWallet } from "@rarible/sdk-wallet"
import { AptosWalletCore } from "@rarible/aptos-wallet/build/wallets/wallet-core"
import { Blockchain } from "@rarible/api-client"
import type { AptosWalletCoreConnectionResult } from "@rarible/connector-aptos-wallet-core"
import type { IWalletAndAddress } from "./wallet-connection"

export function mapAptosCoreWallet<O>(
  provider: AbstractConnectionProvider<O, AptosWalletCoreConnectionResult>,
): ConnectionProvider<O, IWalletAndAddress> {
  return provider.map(state => {
    return {
      wallet: new AptosWallet(new AptosWalletCore(state.provider)),
      address: state.address,
      blockchain: Blockchain.APTOS,
    }
  })
}
