import type { Chain, CreateThirdwebClientOptions, ThirdwebClient } from "thirdweb"
import type { WalletConnectionOption, WalletId } from "thirdweb/wallets"

export type ThirdwebWalletOptionsExtra<Id extends WalletId> = Omit<WalletConnectionOption<Id>, "client" | "chain">

export type ThirdwebChainOrChainId =
  | {
      /**
       * Most chains should be supported. Whole list see below
       * @see https://thirdweb.com/chainlist
       *
       * otherwise you might want to use `chain` prop
       */
      chainId: number
    }
  | {
      /**
       * Provide chain with RPC nodes and other meta
       * information (useful for custom and rare chains)
       */
      chain: Chain
    }

export type ThirdwebProviderConfig<Id extends WalletId> = (
  | {
      /**
       * pass explicit client to be used, it may reduce fetch time
       * on client side.
       *
       * @note Supports thirdweb v5 client
       */
      client: ThirdwebClient
    }
  | CreateThirdwebClientOptions
) & {
  /**
   * If you don't support thirdweb v5 in your project
   * then pass explicit options to setup a connection with thirdweb.
   *
   * Otherwise (in case you use thirdweb v5) you may re-use
   * your existing client by passing `client`
   */
  options: ThirdwebWalletOptionsExtra<Id>
  /**
   * Pass `chainId` or `chain` object to select default chain
   * List of supported chains you may find on the link below
   * @see https://thirdweb.com/chainlist
   *
   * Pass `chainId` or `chain` object
   */
  defaultChain?: ThirdwebChainOrChainId
}
