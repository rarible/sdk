import type { BlockchainWallet, EthereumWallet } from "@rarible/sdk-wallet"
import { FlowWallet, SolanaWallet, WalletType } from "@rarible/sdk-wallet"
import { initProvider } from "@rarible/sdk/src/sdk-blockchains/ethereum/test/init-providers"
import fcl from "@onflow/fcl"
import type { UnionAddress } from "@rarible/types"
import { toUnionAddress } from "@rarible/types"
import { SolanaKeypairWallet } from "@rarible/solana-wallet"
import { createTestAuth, FLOW_TESTNET_ACCOUNT_3, FLOW_TESTNET_ACCOUNT_4 } from "@rarible/flow-test-common"
import { testsConfig } from "./config"
import { Logger } from "./logger"

export function getEthereumWallet(pk: string = testsConfig.variables.ETHEREUM_WALLET_SELLER): EthereumWallet {
  const config = {
    networkId: testsConfig.variables.ETHEREUM_NETWORK_ID,
    rpcUrl: testsConfig.variables.ETHEREUM_RPC_URL,
  }
  const { ethereumWallet } = initProvider(pk, config)
  return ethereumWallet
}

export function getPolygonWallet(pk?: string): EthereumWallet {
  const { ethereumWallet } = initProvider(pk, {
    networkId: 80001,
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
  })
  return ethereumWallet
}

export function getEthereumWalletBuyer(): EthereumWallet {
  return getEthereumWallet(testsConfig.variables.ETHEREUM_WALLET_BUYER)
}

export function getFlowSellerWallet(): FlowWallet {
  const auth = createTestAuth(fcl, "testnet", FLOW_TESTNET_ACCOUNT_3.address, FLOW_TESTNET_ACCOUNT_3.privKey)
  return new FlowWallet(fcl, auth)
}

export function getFlowBuyerWallet(): FlowWallet {
  const auth = createTestAuth(fcl, "testnet", FLOW_TESTNET_ACCOUNT_4.address, FLOW_TESTNET_ACCOUNT_4.privKey)
  return new FlowWallet(fcl, auth)
}

export function getSolanaWallet(walletNumber: number = 0): SolanaWallet {
  const wallets = [testsConfig.variables.SOLANA_WALLET_1, testsConfig.variables.SOLANA_WALLET_2]
  return new SolanaWallet(SolanaKeypairWallet.fromKey(Uint8Array.from(wallets[walletNumber])))
}

export async function getWalletAddressFull(wallet: BlockchainWallet): Promise<WalletAddress> {
  let address = ""
  let addressWithPrefix = ""
  switch (wallet.walletType) {
    case WalletType.ETHEREUM:
      address = await wallet.ethereum.getFrom()
      addressWithPrefix = "ETHEREUM:" + address
      break
    case WalletType.FLOW:
      const auth = wallet.getAuth()
      if (auth) {
        const user = await auth()
        if (user.addr) {
          address = "0x" + user.addr
          addressWithPrefix = "FLOW:" + address
        } else {
          throw new Error("FLOW user address is undefined")
        }
      } else {
        throw new Error("FLOW auth object is not passed to sdk")
      }
      break
    case WalletType.SOLANA:
      address = await wallet.provider.publicKey.toString()
      addressWithPrefix = "SOLANA:" + address
      break
    default:
      throw new Error("Unrecognized wallet")
  }
  const response = {
    address: address,
    addressWithPrefix: addressWithPrefix,
    unionAddress: toUnionAddress(addressWithPrefix),
  }
  Logger.log("wallet_address=", response)
  return response
}

export interface WalletAddress {
  address: string
  addressWithPrefix: string
  unionAddress: UnionAddress
}
