import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import { deployTestErc20 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc20"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { sentTx } from "@rarible/protocol-ethereum-sdk/build/common/send-transaction"
import { createRaribleSdk } from "../../../index"
import { initProviders } from "../test/init-providers"
import { convertEthereumContractAddress } from "../common"
import { convertEthereumUnionAddress } from "../../../../build/sdk-blockchains/ethereum/common"
import { MintType } from "../../../types/nft/mint/domain"
import { awaitAuction } from "../test/await-auction"

describe("buy out auction", () => {
	const { web31, wallet1, web32, wallet2 } = initProviders({
		pk1: undefined,
		pk2: "ded057615d97f0f1c751ea2795bc4b03bbf44844c13ab4f5e6fd976506c276b9",
	})

	const ethereum1 = new Web3Ethereum({ web3: web31, gas: 1000000 })
	const ethwallet1 = new EthereumWallet(ethereum1)
	const sdk1 = createRaribleSdk(ethwallet1, "e2e")

	const ethereum2 = new Web3Ethereum({ web3: web32, gas: 1000000 })
	const ethwallet2 = new EthereumWallet(ethereum2)
	const sdk2 = createRaribleSdk(ethwallet2, "e2e")

	const testErc20Contract = convertEthereumContractAddress("0x4C48DF2D8A8937A59615eDb45281bF048F66F19B", Blockchain.ETHEREUM)
	const testErc721Contract = convertEthereumContractAddress("0x4092e1a67FBE94F1e806Fb9f93F956Fee0093A31", Blockchain.ETHEREUM)
	const testErc1155Contract = convertEthereumContractAddress("0x3D614ceC0d5E25adB35114b7dC2107D6F054581f", Blockchain.ETHEREUM)

	const it = awaitAll({
		testErc20: deployTestErc20(web32, "Test1", "TST1"),
	})

	test("buy out auction erc-721 <-> eth", async () => {

		console.log("mint", it.testErc20.options.address)
		await sentTx(
			it.testErc20.methods.mint(
				await ethwallet2.ethereum.getFrom(), 10000000000
			),
			{ from: await ethwallet1.ethereum.getFrom() }
		)

		const mintAction = await sdk1.nft.mint({ collectionId: testErc721Contract })
		const mintResponse = await mintAction.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: convertEthereumUnionAddress(await ethwallet1.ethereum.getFrom(), Blockchain.ETHEREUM),
				value: 10000,
			}],
			lazyMint: false,
			supply: 1,
		})
		if (mintResponse.type === MintType.ON_CHAIN) {
			await mintResponse.transaction.wait()
		}

		const auctionPrepareResponse = await sdk1.auction.start({ collectionId: testErc1155Contract })
		const auctionId = await auctionPrepareResponse.submit({
			itemId: mintResponse.itemId,
			amount: 1,
			currency: { "@type": "ETH" },
			minimalStep: "0.00000000000000001",
			minimalPrice: "0.00000000000000005",
			duration: 1000,
			startTime: 0,
			buyOutPrice: "0.00000000000000010",
			originFees: [],
			payouts: [],
		})

		await awaitAuction(sdk1, auctionId)
	})

	test("start auction erc-1155 <-> eth", async () => {

		const mintAction = await sdk1.nft.mint({ collectionId: testErc1155Contract })
		const mintResponse = await mintAction.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: convertEthereumUnionAddress(await ethwallet1.ethereum.getFrom(), Blockchain.ETHEREUM),
				value: 10000,
			}],
			lazyMint: false,
			supply: 1,
		})
		if (mintResponse.type === MintType.ON_CHAIN) {
			await mintResponse.transaction.wait()
		}

		const auctionPrepareResponse = await sdk1.auction.start({ collectionId: testErc1155Contract })
		const auctionId = await auctionPrepareResponse.submit({
			itemId: mintResponse.itemId,
			amount: 1,
			currency: { "@type": "ETH" },
			minimalStep: "0.00000000000000001",
			minimalPrice: "0.00000000000000005",
			duration: 1000,
			startTime: 0,
			buyOutPrice: "0.00000000000000010",
			originFees: [],
			payouts: [],
		})

		await awaitAuction(sdk1, auctionId)
	})
})
