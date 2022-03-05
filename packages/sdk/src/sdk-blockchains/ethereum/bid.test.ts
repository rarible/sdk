import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { awaitAll, deployTestErc1155, deployTestErc20, deployTestErc721 } from "@rarible/ethereum-sdk-test-common"
import { toAddress, toContractAddress, toItemId } from "@rarible/types"
import BigNumber from "bignumber.js"
import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk as createEtherumSdk } from "@rarible/protocol-ethereum-sdk"
import { createRaribleSdk } from "../../index"
import { retry } from "../../common/retry"
import { LogsLevel } from "../../domain"
import { initProvider, initProviders } from "./test/init-providers"
import { awaitItem } from "./test/await-item"
import { awaitStock } from "./test/await-stock"
import {
	convertEthereumContractAddress,
	convertEthereumItemId,
	convertEthereumToUnionAddress,
	getEthereumItemId,
} from "./common"
import { resetWethFunds } from "./test/reset-weth-funds"
import { awaitBalance } from "./test/await-balance"

describe("bid", () => {
	const { web31, wallet1, web32 } = initProviders({
		pk1: undefined,
		pk2: "ded057615d97f0f1c751ea2795bc4b03bbf44844c13ab4f5e6fd976506c276b9",
	})

	const ethereum1 = new Web3Ethereum({ web3: web31 })
	const ethwallet1 = new EthereumWallet(ethereum1, Blockchain.ETHEREUM)
	const sdk1 = createRaribleSdk(ethwallet1, "e2e", { logs: LogsLevel.DISABLED })

	const ethereum2 = new Web3Ethereum({ web3: web32 })
	const ethwallet2 = new EthereumWallet(ethereum2, Blockchain.ETHEREUM)
	const sdk2 = createRaribleSdk(ethwallet2, "e2e")
	const ethSdk2 = createEtherumSdk(ethwallet2.ethereum as any, "e2e", { logs: LogsLevel.DISABLED })

	const { web3 } = initProvider()
	const nullFundsEthereum = new Web3Ethereum({ web3: web3 })
	const nullFundsWallet = new EthereumWallet(nullFundsEthereum, Blockchain.ETHEREUM)
	const nullFundsSdk = createRaribleSdk(nullFundsWallet, "e2e", { logs: LogsLevel.DISABLED })

	const wethContractEthereum = toAddress("0xc6f33b62a94939e52e1b074c4ac1a801b869fdb2")
	const wethContract = toContractAddress(`${Blockchain.ETHEREUM}:${wethContractEthereum}`)
	const wethAsset = { "@type": "ERC20" as const, contract: wethContract }

	const e2eErc1155V2ContractAddress = convertEthereumContractAddress("0x268dF35c389Aa9e1ce0cd83CF8E5752b607dE90d", Blockchain.ETHEREUM)

	const it = awaitAll({
		testErc20: deployTestErc20(web31, "Test1", "TST1"),
		testErc721: deployTestErc721(web31, "Test2", "TST2"),
		testErc1155: deployTestErc1155(web31, "Test2"),
	})

	test("bid on erc721 <-> erc20 and update bid", async () => {
		const itemOwner = await ethwallet1.ethereum.getFrom()

		const bidderAddress = await ethwallet2.ethereum.getFrom()
		const bidderUnionAddress = convertEthereumToUnionAddress(bidderAddress, Blockchain.ETHEREUM)

		const tokenId = "1"
		const itemId = convertEthereumItemId(`${it.testErc721.options.address}:${tokenId}`, Blockchain.ETHEREUM)
		await it.testErc721.methods.mint(itemOwner, tokenId, "123").send({
			from: itemOwner,
			gas: 500000,
		})
		await it.testErc20.methods.mint(bidderAddress, "10000000000000").send({
			from: itemOwner,
			gas: 500000,
		})
		await awaitItem(sdk1, itemId)

		await resetWethFunds(ethwallet2, ethSdk2, wethContractEthereum)

		const response = await sdk2.order.bid({ itemId })
		const price = "0.00000000000000002"
		const orderId = await response.submit({
			amount: 1,
			price,
			currency: {
				"@type": "ERC20",
				contract: convertEthereumContractAddress(it.testErc20.options.address, Blockchain.ETHEREUM),
			},
			originFees: [{
				account: bidderUnionAddress,
				value: 1000,
			}],
		})

		const order = await awaitStock(sdk1, orderId, price)
		expect(order.makeStock.toString()).toEqual(price)

		const updateAction = await sdk2.order.bidUpdate({
			orderId,
		})
		await updateAction.submit({ price: "0.00000000000000004" })

		const acceptBidResponse = await sdk1.order.acceptBid({ orderId })
		const acceptBidTx = await acceptBidResponse.submit({ amount: 1, infiniteApproval: true })
		await acceptBidTx.wait()

		await retry(10, 1000, async () => {
			return sdk1.apis.ownership.getOwnershipById({
				ownershipId: `ETHEREUM:${it.testErc721.options.address}:${tokenId}:${bidderAddress}`,
			})
		})
	})

	test("bid on erc-1155, convert to weth and update bid", async () => {
		const itemOwner = await ethwallet1.ethereum.getFrom()

		const bidderAddress = await ethwallet2.ethereum.getFrom()
		const bidderUnionAddress = convertEthereumToUnionAddress(bidderAddress, Blockchain.ETHEREUM)

		const tokenId = "2"
		const itemId = convertEthereumItemId(`${it.testErc1155.options.address}:${tokenId}`, Blockchain.ETHEREUM)
		await it.testErc1155.methods.mint(itemOwner, tokenId, 100, "124").send({
			from: itemOwner,
			gas: 500000,
		})

		await awaitItem(sdk1, itemId)

		await resetWethFunds(ethwallet2, ethSdk2, wethContractEthereum)

		const response = await sdk2.order.bid({ itemId })
		const price = "0.00000000000000002"
		const orderId = await response.submit({
			amount: 3,
			price,
			currency: {
				"@type": "ERC20",
				contract: wethContract,
			},
			originFees: [{
				account: bidderUnionAddress,
				value: 1000,
			}],
		})

		await awaitStock(sdk1, orderId, "0.00000000000000006")

		const updateAction = await sdk2.order.bidUpdate({
			orderId,
		})
		await updateAction.submit({ price: "0.00000000000000004" })

		const acceptBidResponse = await sdk1.order.acceptBid({ orderId })
		const acceptBidTx = await acceptBidResponse.submit({ amount: 1, infiniteApproval: true })
		await acceptBidTx.wait()

		await retry(10, 1000, async () => {
			return sdk1.apis.ownership.getOwnershipById({
				ownershipId: `ETHEREUM:${it.testErc1155.options.address}:${tokenId}:${bidderAddress}`,
			})
		})
	})

	test("getConvertValue returns undefined when passed non-weth contract", async () => {
		const senderRaw = wallet1.getAddressString()

		const tokenId = "3"
		const itemId = convertEthereumItemId(`${it.testErc1155.options.address}:${tokenId}`, Blockchain.ETHEREUM)
		await it.testErc1155.methods.mint(senderRaw, tokenId, 100, "123").send({
			from: senderRaw,
			gas: 500000,
		})
		const bidderAddress = await ethereum2.getFrom()
		const bidderUnionAddress = convertEthereumToUnionAddress(bidderAddress, Blockchain.ETHEREUM)
		await it.testErc20.methods.mint(bidderAddress, "10000000000000").send({
			from: senderRaw,
			gas: 500000,
		})
		await awaitItem(sdk2, itemId)

		await resetWethFunds(ethwallet2, ethSdk2, wethContractEthereum)
		await awaitBalance(sdk2, wethAsset, ethwallet2, "0")

		const bidResponse = await sdk2.order.bid({ itemId })

		await retry(5, 2000, async () => {
			const value = await bidResponse.getConvertableValue({
				assetType: {
					"@type": "ERC20",
					contract: convertEthereumContractAddress(it.testErc20.options.address, Blockchain.ETHEREUM),
				},
				price: "0.00000000000000001",
				amount: 5,
				originFees: [{
					account: bidderUnionAddress,
					value: 1000,
				}],
			})

			expect(value).toBe(undefined)
		})
	})

	test("getConvertValue returns insufficient type", async () => {
		const senderRaw = wallet1.getAddressString()

		const tokenId = "4"
		const itemId = convertEthereumItemId(`${it.testErc1155.options.address}:${tokenId}`, Blockchain.ETHEREUM)
		await it.testErc1155.methods.mint(senderRaw, tokenId, 100, "123").send({
			from: senderRaw,
			gas: 500000,
		})
		await awaitItem(nullFundsSdk, itemId)

		const bidResponse = await nullFundsSdk.order.bid({ itemId })

		await retry(5, 2000, async () => {
			const value = await bidResponse.getConvertableValue({
				assetType: { "@type": "ERC20", contract: wethContract },
				price: "0.00000000000000001",
				amount: 5,
				originFees: [{
					account: convertEthereumToUnionAddress(await ethereum2.getFrom(), Blockchain.ETHEREUM),
					value: 1000,
				}],
			})

			if (!value) throw new Error("Convertable value must be non-undefined")
			expect(value.value.toString()).toBe("0.000000000000000055")
			expect(value.type).toBe("insufficient")
		})
	})

	test("getConvertableValue returns undefined", async () => {
		const itemId = toItemId(`${Blockchain.ETHEREUM}:0xF04881F205644925596Fee9D66DACd98A9b99F05:1`)

		const bidResponse = await sdk2.order.bid({ itemId })

		const bidderUnionAddress = convertEthereumToUnionAddress(await ethereum2.getFrom(), Blockchain.ETHEREUM)
		const wethAsset = { "@type": "ERC20" as const, contract: wethContract }
		const wethBidderBalance = new BigNumber(await sdk2.balances.getBalance(bidderUnionAddress, wethAsset))

		if (wethBidderBalance.lt("0.000000000000001")) {
			const tx = await ethSdk2.balances.convert(
				{ assetClass: "ETH" },
				{ assetClass: "ERC20", contract: toAddress(wethContractEthereum) },
				"0.0000000000000055"
			)
			await tx.wait()
		}

		await retry(5, 2000, async () => {
			const value = await bidResponse.getConvertableValue({
				assetType: { "@type": "ERC20", contract: wethContract },
				price: "0.000000000000001",
				amount: 5,
				originFees: [{
					account: convertEthereumToUnionAddress(await ethereum2.getFrom(), Blockchain.ETHEREUM),
					value: 1000,
				}],
			})

			expect(value).toBe(undefined)
		})
	})

	test("getConvertableValue returns convertable value", async () => {
		const itemId = toItemId(`${Blockchain.ETHEREUM}:0xF04881F205644925596Fee9D66DACd98A9b99F05:1`)

		const bidResponse = await sdk2.order.bid({ itemId })

		await resetWethFunds(ethwallet2, ethSdk2, wethContractEthereum)
		await awaitBalance(sdk2, wethAsset, ethwallet2, "0")

		await retry(5, 2000, async () => {
			const value = await bidResponse.getConvertableValue({
				assetType: wethAsset,
				price: "0.000000000000001",
				amount: 5,
				originFees: [{
					account: convertEthereumToUnionAddress(await ethereum2.getFrom(), Blockchain.ETHEREUM),
					value: 1000,
				}],
			})

			if (!value) throw new Error("Convertable value must be non-undefined")
			expect(value.type).toBe("convertable")
			expect(new BigNumber(value.value).isEqualTo("0.0000000000000055")).toBeTruthy()
		})
	})

	test("bid for collection", async () => {
		const ownerCollectionAddress = await ethereum1.getFrom()
		const bidderAddress = await ethereum2.getFrom()

		await it.testErc20.methods.mint(bidderAddress, "10000000000000").send({
      	from: ownerCollectionAddress,
      	gas: 500000,
		})
		const tokenId = "5"
		const itemId = convertEthereumItemId(`${it.testErc721.options.address}:${tokenId}`, Blockchain.ETHEREUM)

		await it.testErc721.methods.mint(ownerCollectionAddress, tokenId, "0").send({
			from: ownerCollectionAddress,
			gas: 500000,
		})
		await awaitItem(sdk1, itemId)

		const erc721Contract = convertEthereumContractAddress(it.testErc721.options.address, Blockchain.ETHEREUM)
		const bidResponse = await sdk2.order.bid({
			collectionId: erc721Contract,
		})

		const erc20Contract = convertEthereumContractAddress(it.testErc20.options.address, Blockchain.ETHEREUM)
		const bidOrderId = await bidResponse.submit({
			amount: 1,
			price: "0.00000000000000001",
			currency: {
				"@type": "ERC20",
				contract: erc20Contract,
			},
			expirationDate: new Date(Date.now() + 20000),
		})

		const acceptBidResponse = await sdk1.order.acceptBid({
			orderId: bidOrderId,
		})
		const fillBidResult = await acceptBidResponse.submit({
			amount: 1,
			infiniteApproval: true,
			itemId: toItemId(`${erc721Contract}:${tokenId}`),
		})
		await fillBidResult.wait()
	})

	test("bid for collection with outdated expiration date", async () => {
		const ownerCollectionAddress = await ethereum1.getFrom()
		const bidderAddress = await ethereum2.getFrom()

		await it.testErc20.methods.mint(bidderAddress, "10000000000000").send({
      	from: ownerCollectionAddress,
      	gas: 500000,
		})
		const tokenId = "6"
		const itemId = convertEthereumItemId(`${it.testErc721.options.address}:${tokenId}`, Blockchain.ETHEREUM)

		await it.testErc721.methods.mint(ownerCollectionAddress, tokenId, "1").send({
			from: ownerCollectionAddress,
			gas: 500000,
		})
		await awaitItem(sdk1, itemId)

		const erc721Contract = convertEthereumContractAddress(it.testErc721.options.address, Blockchain.ETHEREUM)
		const bidResponse = await sdk2.order.bid({
			collectionId: erc721Contract,
		})

		const erc20Contract = convertEthereumContractAddress(it.testErc20.options.address, Blockchain.ETHEREUM)
		const bidOrderId = await bidResponse.submit({
			amount: 1,
			price: "0.00000000000000001",
			currency: {
				"@type": "ERC20",
				contract: erc20Contract,
			},
			expirationDate: new Date(),
		})

		const acceptBidResponse = await sdk1.order.acceptBid({
			orderId: bidOrderId,
		})
		let errorMessage
		try {
			const fillBidResult = await acceptBidResponse.submit({
				amount: 1,
				infiniteApproval: true,
				itemId: toItemId(`${erc721Contract}:${tokenId}`),
			})
			await fillBidResult.wait()
		} catch (e: any) {
			errorMessage = e.message
		}
		expect(errorMessage).toEqual("The execution failed due to an exception.\nReverted")
	})

	test.skip("bid for collection and accept bid on lazy item", async () => {
		const ownerCollectionAddress = await ethereum1.getFrom()
		const bidderAddress = await ethereum2.getFrom()

		await it.testErc20.methods.mint(bidderAddress, "10000000000000").send({
      	from: ownerCollectionAddress,
      	gas: 500000,
		})

		const action = await sdk1.nft.mint({ collectionId: e2eErc1155V2ContractAddress })

		const mintResult = await action.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: convertEthereumToUnionAddress(ownerCollectionAddress, Blockchain.ETHEREUM),
				value: 10000,
			}],
			royalties: [],
			lazyMint: true,
			supply: 10,
		})

		await awaitItem(sdk1, mintResult.itemId)

		const bidResponse = await sdk2.order.bid({
			collectionId: e2eErc1155V2ContractAddress,
		})

		const erc20Contract = convertEthereumContractAddress(it.testErc20.options.address, Blockchain.ETHEREUM)
		const bidOrderId = await bidResponse.submit({
			amount: 10,
			price: "0.00000000000000001",
			currency: {
				"@type": "ERC20",
				contract: erc20Contract,
			},
		})

		const acceptBidResponse = await sdk1.order.acceptBid({
			orderId: bidOrderId,
		})

		const { tokenId } = getEthereumItemId(mintResult.itemId)
		const fillBidResult = await acceptBidResponse.submit({
			amount: 10,
			infiniteApproval: true,
			itemId: toItemId(`${e2eErc1155V2ContractAddress}:${tokenId}`),
		})
		await fillBidResult.wait()

		await retry(10, 1000, async () => {
			 const ownership = await sdk1.apis.ownership.getOwnershipById({
				ownershipId: `${mintResult.itemId}:${bidderAddress}`,
			})
			expect(ownership.value).toBe("10")
		})
	})
})
