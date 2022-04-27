import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { EthereumWallet, FlowWallet, SolanaWallet } from "@rarible/sdk-wallet"
import { BlockchainGroup } from "@rarible/api-client"
import { initProvider } from "@rarible/sdk/src/sdk-blockchains/ethereum/test/init-providers"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import fcl from "@onflow/fcl"
import type { UnionAddress } from "@rarible/types"

import { toUnionAddress } from "@rarible/types"
// eslint-disable-next-line camelcase
import { in_memory_provider } from "@rarible/tezos-sdk/dist/providers/in_memory/in_memory_provider"
import { TezosWallet } from "@rarible/sdk-wallet"
import { SolanaKeypairWallet } from "@rarible/solana-wallet"
import { testsConfig } from "./config"

export function getEthereumWallet(pk?: string): EthereumWallet {
	const config = {
		networkId: testsConfig.variables.ETHEREUM_NETWORK_ID,
		rpcUrl: testsConfig.variables.ETHEREUM_RPC_URL,
	}
	const { web3, wallet } = initProvider(pk, config)
	const ethereum = new Web3Ethereum({
		web3: web3,
		from: wallet.getAddressString(),
	})
	return new EthereumWallet(ethereum)
}

export function getPolygonWallet(pk?: string): EthereumWallet {
	const { web3, wallet } = initProvider(pk, {
		networkId: 80001,
		rpcUrl: "https://rpc-mumbai.maticvigil.com",
	})
	const ethereum = new Web3Ethereum({
		web3: web3,
		from: wallet.getAddressString(),
	})
	return new EthereumWallet(ethereum)
}

export function getEthereumWalletBuyer(): EthereumWallet {
	return getEthereumWallet(testsConfig.variables.ETHEREUM_WALLET_BUYER)
}

export function getTezosTestWallet(walletNumber: number = 0): TezosWallet {
	const edsks = [
		testsConfig.variables.TEZOS_WALLET_1,
		testsConfig.variables.TEZOS_WALLET_2,
		testsConfig.variables.TEZOS_WALLET_3,
	]
	return new TezosWallet(
		in_memory_provider(
			edsks[walletNumber],
			testsConfig.variables.TEZOS_WALLET_ENDPOINT
		)
	)
}

export function getFlowWallet(): FlowWallet {
	//const { authUser1 } = createTestFlowAuth(fcl)
	return new FlowWallet(fcl)
}

export function getSolanaWallet(walletNumber: number = 0): SolanaWallet {
	const wallets = [
		testsConfig.variables.SOLANA_WALLET_1,
		testsConfig.variables.SOLANA_WALLET_2,
	]
	return new SolanaWallet(SolanaKeypairWallet.createFrom(Uint8Array.from(wallets[walletNumber])))
}

export async function getWalletAddress(wallet: BlockchainWallet, withPrefix: boolean = true): Promise<string> {
	switch (wallet.blockchain) {
		case BlockchainGroup.ETHEREUM:
			return (withPrefix ? "ETHEREUM:" : "") + (await wallet.ethereum.getFrom())
		case BlockchainGroup.TEZOS:
			return (withPrefix ? "TEZOS:" : "") + (await wallet.provider.address())
		case BlockchainGroup.FLOW:
			const user = await wallet.fcl.currentUser().snapshot()
			const address = user.addr
			return (withPrefix ? "FLOW:" : "") + address
		default: throw new Error("Unrecognized wallet")
	}
}

export async function getWalletAddressFull(wallet: BlockchainWallet): Promise<WalletAddress> {
	console.log("Getting wallet_address for wallet=", wallet)
	let address=""
	let addressWithPrefix=""
	switch (wallet.blockchain) {
		case BlockchainGroup.ETHEREUM:
			address = await wallet.ethereum.getFrom()
			addressWithPrefix = "ETHEREUM:" + address
			break
		case BlockchainGroup.TEZOS:
			address = await wallet.provider.address()
			addressWithPrefix = "TEZOS:" + address
			break
		case BlockchainGroup.FLOW:
			const user = await wallet.fcl.currentUser().snapshot()
			if (user.addr) {
				address = user.addr
				addressWithPrefix = "FLOW:" + address
			} else {
				throw new Error("FLOW user address is undefined")
			}
			break
		case BlockchainGroup.SOLANA:
			address = await wallet.provider.publicKey.toString()
			addressWithPrefix = "SOLANA:" + address
			break
		default: throw new Error("Unrecognized wallet")
	}
	const response = {
		address: address,
		addressWithPrefix: addressWithPrefix,
		unionAddress: toUnionAddress(addressWithPrefix),
	}
	console.log("wallet_address=", response)
	return response
}

export interface WalletAddress {
	address: string,
	addressWithPrefix: string
	unionAddress: UnionAddress
}
