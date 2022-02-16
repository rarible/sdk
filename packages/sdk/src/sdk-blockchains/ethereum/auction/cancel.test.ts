import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk } from "../../../index"
import { initProvider, initProviders } from "../test/init-providers"
import { convertEthereumContractAddress, convertEthereumToUnionAddress } from "../common"
import { retry } from "../../../common/retry"

describe("cancel action", () => {
	const {
		web31,
	} = initProviders({
		pk1: undefined,
		pk2: "ded057615d97f0f1c751ea2795bc4b03bbf44844c13ab4f5e6fd976506c276b9",
	})
	const { wallet: feeWallet } = initProvider()

	const feeAddress = feeWallet.getAddressString()
	const feeUnionAddress = convertEthereumToUnionAddress(feeAddress, Blockchain.ETHEREUM)
	const ethereum1 = new Web3Ethereum({
		web3: web31,
		gas: 1000000,
	})
	const ethwallet1 = new EthereumWallet(ethereum1)
	const sdkSeller = createRaribleSdk(ethwallet1, "e2e")

	const testErc721Contract = convertEthereumContractAddress("0x4092e1a67FBE94F1e806Fb9f93F956Fee0093A31", Blockchain.ETHEREUM)

	test("cancel auction erc-721 <-> eth", async () => {
		const mintAction = await sdkSeller.nft.mint({ collectionId: testErc721Contract })
		const mintResponse = await mintAction.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: convertEthereumToUnionAddress(await ethwallet1.ethereum.getFrom(), Blockchain.ETHEREUM),
				value: 10000,
			}],
			lazyMint: false,
			supply: 1,
		})

		const auctionPrepareResponse = await sdkSeller.auction.start({ collectionId: testErc721Contract })
		const startResponse = await auctionPrepareResponse.submit({
			itemId: mintResponse.itemId,
			amount: 1,
			currency: { "@type": "ETH" },
			minimalStep: "0.00000000000000001",
			minimalPrice: "0.00000000000000005",
			duration: 1,
			startTime: 0,
			buyOutPrice: "0.00000000000000009",
			originFees: [{
				account: feeUnionAddress,
				value: 1000,
			}],
		})

		await startResponse.tx.wait()

		const cancelTx = await sdkSeller.auction.cancel({ auctionId: startResponse.auctionId })
		await cancelTx.wait()
		await retry(1, 2000, async () => {
			const auction = await sdkSeller.apis.auction.getAuctionById({ id: startResponse.auctionId })
			console.log(auction)
		})
	})

})
