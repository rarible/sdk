import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk } from "../../../index"
import { initProviders } from "../test/init-providers"
import { convertEthereumContractAddress } from "../common"
import { convertEthereumToUnionAddress } from "../../../../build/sdk-blockchains/ethereum/common"
import { MintType } from "../../../types/nft/mint/domain"
import { awaitAuction } from "../test/await-auction"

describe("start auction", () => {
	const {
		web31,
		wallet1,
		web32,
		wallet2,
	} = initProviders({
		pk1: undefined,
		pk2: "ded057615d97f0f1c751ea2795bc4b03bbf44844c13ab4f5e6fd976506c276b9",
	})

	const ethereum1 = new Web3Ethereum({
		web3: web31,
		gas: 1000000,
	})
	const ethwallet1 = new EthereumWallet(ethereum1)
	const sdk1 = createRaribleSdk(ethwallet1, "e2e")

	const ethereum2 = new Web3Ethereum({
		web3: web32,
		gas: 1000000,
	})
	const ethwallet2 = new EthereumWallet(ethereum2)
	const sdk2 = createRaribleSdk(ethwallet2, "e2e")

	const testErc721Contract = convertEthereumContractAddress("0x4092e1a67FBE94F1e806Fb9f93F956Fee0093A31", Blockchain.ETHEREUM)
	const testErc1155Contract = convertEthereumContractAddress("0x3D614ceC0d5E25adB35114b7dC2107D6F054581f", Blockchain.ETHEREUM)


})
