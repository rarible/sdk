import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import { initProvider } from "@rarible/sdk/src/sdk-blockchains/ethereum/test/init-providers"
import { EthereumWallet, FlowWallet } from "@rarible/sdk-wallet"
import type { TezosWallet } from "@rarible/sdk-wallet"
import { createTestWallet as createTezosWallet } from "@rarible/sdk/src/sdk-blockchains/tezos/test/test-wallet"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import fcl from "@onflow/fcl"

export function getEthereumWallet(pk?: string): EthereumWallet {
	const { web3, wallet } = initProvider(pk)
	const ethereum = new Web3Ethereum({
		web3: web3,
		from: wallet.getAddressString(),
	})
	return new EthereumWallet(ethereum)
}

export function getTezosTestWallet(walletNumber: number = 0): TezosWallet {
	const edsks = [
		"edskS143x9JtTcFUxE5UDT9Tajkx9hdLha9mQhijSarwsKM6fzBEAuMEttFEjBYL7pT4o5P5yRqFGhUmqEynwviMk5KJ8iMgTw",
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
		"edskS4QxJFDSkHaf6Ax3ByfrZj5cKvLUR813uqwE94baan31c1cPPTMvoAvUKbEv2xM9mvtwoLANNTBSdyZf3CCyN2re7qZyi3",
	]

	return createTezosWallet(edsks[walletNumber])
}

export function getFlowWallet(): FlowWallet {
	//const { authUser1 } = createTestFlowAuth(fcl)
	return new FlowWallet(fcl)
}

export async function getWalletAddress(wallet: BlockchainWallet, withPrefix: boolean = true): Promise<string> {
	switch (wallet.blockchain) {
		case Blockchain.ETHEREUM:
			return (withPrefix ? "ETHEREUM:" : "") + (await wallet.ethereum.getFrom())
		case Blockchain.TEZOS:
			return (withPrefix ? "TEZOS:" : "") + (await wallet.provider.address())
		case Blockchain.FLOW:
			const user = await wallet.fcl.currentUser().snapshot()
			const address = user.addr
			return (withPrefix ? "FLOW:" : "") + address
		default: throw new Error("Unrecognized wallet")
	}
}
