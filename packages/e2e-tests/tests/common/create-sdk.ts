import type { Blockchain } from "@rarible/api-client"
import type{ IRaribleSdk } from "@rarible/sdk/src/domain"
import type{ BlockchainWallet } from "@rarible/sdk-wallet"
import { EthereumWallet } from "@rarible/sdk-wallet"
import type{ RaribleSdkEnvironment } from "@rarible/sdk/src/config/domain"
import { initProviders } from "@rarible/sdk/src/sdk-blockchains/ethereum/test/init-providers"
import { createTestWallet as createTezosWallet } from "@rarible/sdk/src/sdk-blockchains/tezos/test/test-wallet"
import { createRaribleSdk } from "@rarible/sdk"
import { Web3Ethereum } from "@rarible/web3-ethereum"

export function createSdk(blockchain: Blockchain): { sdk: IRaribleSdk, wallet: BlockchainWallet } {
	let wallet: BlockchainWallet | undefined = undefined
	let env: RaribleSdkEnvironment = "e2e"

	switch (blockchain) {
		case "ETHEREUM":
			const { web31, wallet1 } = initProviders()
			const ethereum = new Web3Ethereum({
				web3: web31,
				from: wallet1.getAddressString(),
			})
			wallet = new EthereumWallet(ethereum)
			break
		case "TEZOS":
			wallet = createTezosWallet(
				"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj"
			)
			env = "dev" // @todo: tezos not working in e2e, need to fix (?)
			break
		case "FLOW":
		case "POLYGON":
		default:
			throw new Error(`Unsupported blockchain ${blockchain}`)
	}

	return {
		sdk: createRaribleSdk(wallet, env),
		wallet: wallet,
	}
}
