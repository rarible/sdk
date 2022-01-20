import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { deployTestErc20 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc20"
import { deployTestErc721 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc721"
import { toAddress, toBigNumber, toContractAddress, toItemId, toUnionAddress } from "@rarible/types"
import BigNumber from "bignumber.js"
import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk as createEtherumSdk } from "@rarible/protocol-ethereum-sdk"
import { createRaribleSdk } from "../../index"
import { retry } from "../../common/retry"
import { initProviders } from "./test/init-providers"
import { awaitItem } from "./test/await-item"
import { awaitStock } from "./test/await-stock"
import { convertEthereumUnionAddress, convertToEthereumAssetType } from "./common"

describe("bid", () => {
	const { web31, wallet1, web32, wallet2 } = initProviders({
		pk1: undefined,
		pk2: "ded057615d97f0f1c751ea2795bc4b03bbf44844c13ab4f5e6fd976506c276b9",
	})

	const ethereum1 = new Web3Ethereum({ web3: web31 })
	const ethwallet1 = new EthereumWallet(ethereum1)
	const sdk1 = createRaribleSdk(ethwallet1, "e2e")

	const ethereum2 = new Web3Ethereum({ web3: web32 })
	const ethwallet2 = new EthereumWallet(ethereum2)
	const sdk2 = createRaribleSdk(ethwallet2, "e2e")
	const ethSdk2 = createEtherumSdk(ethwallet2.ethereum as any, "e2e")

	const wethContractEthereum = "0xc6f33b62a94939e52e1b074c4ac1a801b869fdb2"
	const wethContract = toContractAddress(`${Blockchain.ETHEREUM}:${wethContractEthereum}`)

	const it = awaitAll({
		testErc20: deployTestErc20(web31, "Test1", "TST1"),
		testErc721: deployTestErc721(web31, "Test2", "TST2"),
	})

	test("bid on erc721, convert to weth and update bid", async () => {
		const itemOwner = await ethwallet1.ethereum.getFrom()

		const bidderAddress = await ethwallet2.ethereum.getFrom()
		const bidderUnionAddress = toUnionAddress(`ETHEREUM:${bidderAddress}`)

		const wethAsset = { "@type": "ERC20" as const, contract: wethContract }
		const tokenId = "1"
		const itemId = toItemId(
			`ETHEREUM:${it.testErc721.options.address}:${tokenId}`
		)
		await it.testErc721.methods.mint(itemOwner, tokenId, "123").send({
			from: itemOwner,
			gas: 500000,
		})

		await awaitItem(sdk1, itemId)

		const wethBidderBalance = new BigNumber(await sdk1.balances.getBalance(bidderUnionAddress, wethAsset))

		if (wethBidderBalance.gt("0")) {
			const tx = await ethSdk2.balances.convert(
				convertToEthereumAssetType({ "@type": "ERC20", contract: wethContract }),
				convertToEthereumAssetType({ "@type": "ETH" }),
				wethBidderBalance
			)
			await tx.wait()
		}

		const response = await sdk2.order.bid({ itemId })
		const price = "0.000000000000000002"
		const orderId = await response.submit({
			amount: 1,
			price,
			currency: {
				"@type": "ERC20",
				contract: wethContract,
			},
		})

		const order = await awaitStock(sdk1, orderId, price)
		expect(order.makeStock.toString()).toEqual(price)

		const updateAction = await sdk2.order.bidUpdate({
			orderId,
		})
		await updateAction.submit({ price: "0.000000000000000004" })

		const acceptBidResponse = await sdk1.order.acceptBid({ orderId })
		const acceptBidTx = await acceptBidResponse.submit({ amount: 1, infiniteApproval: true })
		await acceptBidTx.wait()

		await retry(10, 1000, async () => {
			return sdk1.apis.ownership.getOwnershipById({
				ownershipId: `ETHEREUM:${it.testErc721.options.address}:${tokenId}:${bidderAddress}`,
			})
		})
	})

	test("getConvertValue returns insufficient type", async () => {
		const senderRaw = wallet1.getAddressString()

		const tokenId = "2"
		const itemId = toItemId(
			`ETHEREUM:${it.testErc721.options.address}:${tokenId}`
		)
		await it.testErc721.methods.mint(senderRaw, tokenId, "123").send({
			from: senderRaw,
			gas: 500000,
		})
		await awaitItem(sdk1, itemId)

		const bidResponse = await sdk1.order.bid({ itemId })

		const value = await bidResponse.getConvertableValue(
			{ "@type": "ERC20", contract: wethContract },
			"0.00001",
			convertEthereumUnionAddress(wallet1.getAddressString(), Blockchain.ETHEREUM),
		)


		expect(value).not.toBe(undefined)

		if (value) {
			expect(value.value.toString()).toBe("0.00001")
			expect(value.type).toBe("insufficient")
		}

	})

	test("getConvertableValue returns undefined", async () => {
		const itemId = toItemId(`${Blockchain.ETHEREUM}:0xF04881F205644925596Fee9D66DACd98A9b99F05:1`)

		const bidResponse = await sdk2.order.bid({ itemId })

		const bidderUnionAddress = toUnionAddress(`ETHEREUM:${await ethereum2.getFrom()}`)
		const wethAsset = { "@type": "ERC20" as const, contract: wethContract }
		const wethBidderBalance = new BigNumber(await sdk2.balances.getBalance(bidderUnionAddress, wethAsset))

		if (wethBidderBalance.lt("0.000000000000001")) {
			const tx = await ethSdk2.balances.convert(
				{ assetClass: "ETH" },
				{ assetClass: "ERC20", contract: toAddress(wethContractEthereum) },
				"0.000000000000001"
			)
			await tx.wait()
		}

		const value = await bidResponse.getConvertableValue(
			{ "@type": "ERC20", contract: wethContract },
			"0.000000000000001",
			convertEthereumUnionAddress(wallet2.getAddressString(), Blockchain.ETHEREUM)
		)

		expect(value).toBe(undefined)
	})


	test("bid for collection", async () => {
		const ownerCollectionAddress = await ethereum1.getFrom()
		const bidderAddress = await ethereum2.getFrom()

		await it.testErc20.methods.mint(bidderAddress, "10000000000000").send({
      	from: ownerCollectionAddress,
      	gas: 500000,
		})
		const erc721TokenId = "3"
		const itemId = toItemId(
			`ETHEREUM:${it.testErc721.options.address}:${erc721TokenId}`
		)

		await it.testErc721.methods.mint(ownerCollectionAddress, erc721TokenId, "0").send({
			from: ownerCollectionAddress,
			gas: 500000,
		})
		await awaitItem(sdk1, itemId)

		const erc721Contract = toContractAddress(`ETHEREUM:${it.testErc721.options.address}`)
		const bidResponse = await sdk2.order.bid({
			collectionId: erc721Contract,
		})

		const erc20Contract = toContractAddress(`ETHEREUM:${it.testErc20.options.address}`)
		const bidOrderId = await bidResponse.submit({
			amount: 1,
			price: "0.00000000000000001",
			currency: {
				"@type": "ERC20",
				contract: erc20Contract,
			},
		})

		const acceptBidResponse = await sdk1.order.acceptBid({
			orderId: bidOrderId,
		})
		const fillBidResult = await acceptBidResponse.submit({
			amount: 1,
			infiniteApproval: true,
			assetType: {
			  "@type": "ERC721",
				contract: erc721Contract,
				tokenId: toBigNumber(erc721TokenId),
			},
		})
		await fillBidResult.wait()
	})
})
