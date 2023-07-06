import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import {
	getTestErc20Contract,
} from "@rarible/ethereum-sdk-test-common"
import { toAddress, toCollectionId, toContractAddress, toCurrencyId, toItemId } from "@rarible/types"
import BigNumber from "bignumber.js"
import type { EthErc20AssetType } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk as createEtherumSdk } from "@rarible/protocol-ethereum-sdk"
import { sentTxConfirm } from "@rarible/protocol-ethereum-sdk/build/common/send-transaction"
import { createRaribleSdk } from "../../index"
import { retry } from "../../common/retry"
import { LogsLevel } from "../../domain"
import { MintType } from "../../types/nft/mint/prepare"
import { awaitItem } from "../../common/test/await-item"
import { awaitStock } from "../../common/test/await-stock"
import { initProvider, initProviders } from "./test/init-providers"
import {
	convertEthereumCollectionId,
	convertEthereumContractAddress,
	convertEthereumToUnionAddress,
} from "./common"
import { resetWethFunds } from "./test/reset-weth-funds"
import { DEV_PK_1, DEV_PK_2 } from "./test/common"

describe("bid", () => {
	const { web31, web32 } = initProviders({
		pk1: DEV_PK_1,
		pk2: DEV_PK_2,
	})

	const ethereum1 = new Web3Ethereum({ web3: web31 })
	const ethwallet1 = new EthereumWallet(ethereum1)
	const sdk1 = createRaribleSdk(ethwallet1, "development", { logs: LogsLevel.DISABLED })

	const ethereum2 = new Web3Ethereum({ web3: web32 })
	const ethwallet2 = new EthereumWallet(ethereum2)
	const sdk2 = createRaribleSdk(ethwallet2, "development", { logs: LogsLevel.DISABLED })
	const ethSdk2 = createEtherumSdk(ethwallet2.ethereum as any, "dev-ethereum", { logs: { level: LogsLevel.DISABLED } })


	const { web3 } = initProvider(undefined)
	const nullFundsEthereum = new Web3Ethereum({ web3: web3 })
	const nullFundsWallet = new EthereumWallet(nullFundsEthereum)
	const nullFundsSdk = createRaribleSdk(nullFundsWallet, "development", { logs: LogsLevel.DISABLED })

	const wethContractEthereum = toAddress("0x55eB2809896aB7414706AaCDde63e3BBb26e0BC6")
	const wethContract = toContractAddress(`${Blockchain.ETHEREUM}:${wethContractEthereum}`)
	const wethAsset = { "@type": "ERC20" as const, contract: wethContract }

	const erc721Address = toAddress("0x96CE5b00c75e28d7b15F25eA392Cbb513ce1DE9E")
	const erc1155Address = toAddress("0xda75B20cCFf4F86d2E8Ef00Da61A166edb7a233a")
	const e2eErc721ContractAddress = convertEthereumCollectionId(erc721Address, Blockchain.ETHEREUM)
	const e2eErc1155V2ContractAddress = convertEthereumCollectionId(erc1155Address, Blockchain.ETHEREUM)
	const erc20 = toAddress("0xA4A70E8627e858567a9f1F08748Fe30691f72b9e")
	const erc20ContractAddress = convertEthereumContractAddress(erc20, Blockchain.ETHEREUM)
	const testErc20 = getTestErc20Contract(web32, erc20)

	beforeAll(async () => {
		await sentTxConfirm(testErc20.methods.mint(await ethereum2.getFrom(), "99999000000000000000000"), {
			from: await ethereum2.getFrom(),
			gas: 2000000,
		})
	})

	test("bid on erc1155 <-> erc20 and update bid", async () => {
		const itemOwner = await ethwallet1.ethereum.getFrom()

		const bidderAddress = await ethwallet2.ethereum.getFrom()
		const bidderUnionAddress = convertEthereumToUnionAddress(bidderAddress, Blockchain.ETHEREUM)

		const action = await sdk1.nft.mint.prepare({
			collectionId: convertEthereumCollectionId(erc1155Address, Blockchain.ETHEREUM),
		})
		const result = await action.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: convertEthereumToUnionAddress(itemOwner, Blockchain.ETHEREUM),
				value: 10000,
			}],
			royalties: [],
			lazyMint: true,
			supply: 1,
		})
		if (result.type === MintType.ON_CHAIN) {
			await result.transaction.wait()
		}

		await awaitItem(sdk1, result.itemId)

		// await resetWethFunds(ethwallet2, ethSdk2, wethContractEthereum)

		const response = await sdk2.order.bid.prepare({ itemId: result.itemId })
		const price = "0.00002"
		const orderId = await response.submit({
			amount: 1,
			price,
			currency: {
				"@type": "ERC20",
				contract: erc20ContractAddress,
			},
			originFees: [{
				account: bidderUnionAddress,
				value: 1000,
			}],
			expirationDate: new Date(Date.now() + 60 * 60 * 1000),
		})
		const order = await awaitStock(sdk1, orderId, price)
		expect(order.makeStock.toString()).toEqual(price)

		const updateAction = await sdk2.order.bidUpdate.prepare({
			orderId,
		})
		const updatedOrder = await updateAction.submit({ price: "0.00004" })

		const acceptBidResponse = await sdk1.order.acceptBid.prepare({ orderId: updatedOrder })
		const acceptBidTx = await acceptBidResponse.submit({ amount: 1, infiniteApproval: true })
		await acceptBidTx.wait()

		await retry(10, 1000, async () => {
			return sdk1.apis.ownership.getOwnershipById({
				ownershipId: `${result.itemId}:${bidderAddress}`,
			})
		})
	})

	test("bid on erc721 <-> erc20 and update bid", async () => {
		const itemOwner = await ethwallet1.ethereum.getFrom()

		const bidderAddress = await ethwallet2.ethereum.getFrom()
		const bidderUnionAddress = convertEthereumToUnionAddress(bidderAddress, Blockchain.ETHEREUM)

		const action = await sdk1.nft.mint.prepare({
			collectionId: convertEthereumCollectionId(erc721Address, Blockchain.ETHEREUM),
		})
		const result = await action.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: convertEthereumToUnionAddress(itemOwner, Blockchain.ETHEREUM),
				value: 10000,
			}],
			royalties: [],
			lazyMint: false,
			supply: 1,
		})
		if (result.type === MintType.ON_CHAIN) {
			await result.transaction.wait()
		}

		await awaitItem(sdk1, result.itemId)

		// await resetWethFunds(ethwallet2, ethSdk2, wethContractEthereum)

		const response = await sdk2.order.bid.prepare({ itemId: result.itemId })
		const price = "0.00002"
		const orderId = await response.submit({
			amount: 1,
			price,
			currency: {
				"@type": "ERC20",
				contract: erc20ContractAddress,
			},
			originFees: [{
				account: bidderUnionAddress,
				value: 1000,
			}],
			expirationDate: new Date(Date.now() + 60 * 60 * 1000),
		})

		const order = await awaitStock(sdk1, orderId, price)
		expect(order.makeStock.toString()).toEqual(price)

		const updateAction = await sdk2.order.bidUpdate.prepare({
			orderId,
		})
		const updatedOrder = await updateAction.submit({ price: "0.00004" })

		const acceptBidResponse = await sdk1.order.acceptBid.prepare({ orderId: updatedOrder })
		const acceptBidTx = await acceptBidResponse.submit({ amount: 1, infiniteApproval: true })
		await acceptBidTx.wait()

		await retry(10, 1000, async () => {
			return sdk1.apis.ownership.getOwnershipById({
				ownershipId: `${result.itemId}:${bidderAddress}`,
			})
		})
	})

	test("bid on erc1155 lazy <-> erc20 and update bid", async () => {
		const itemOwner = await ethwallet1.ethereum.getFrom()

		const bidderAddress = await ethwallet2.ethereum.getFrom()
		const bidderUnionAddress = convertEthereumToUnionAddress(bidderAddress, Blockchain.ETHEREUM)

		const action = await sdk1.nft.mint.prepare({
			collectionId: convertEthereumCollectionId(erc721Address, Blockchain.ETHEREUM),
		})
		const result = await action.submit({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			creators: [{
				account: convertEthereumToUnionAddress(itemOwner, Blockchain.ETHEREUM),
				value: 10000,
			}],
			royalties: [],
			lazyMint: true,
			supply: 1,
		})
		if (result.type === MintType.ON_CHAIN) {
			await result.transaction.wait()
		}

		await awaitItem(sdk1, result.itemId)

		// await resetWethFunds(ethwallet2, ethSdk2, wethContractEthereum)

		const response = await sdk2.order.bid.prepare({ itemId: result.itemId })
		const price = "0.00002"
		const orderId = await response.submit({
			amount: 1,
			price,
			currency: {
				"@type": "ERC20",
				contract: erc20ContractAddress,
			},
			originFees: [{
				account: bidderUnionAddress,
				value: 1000,
			}],
			expirationDate: new Date(Date.now() + 60 * 60 * 1000),
		})

		const order = await awaitStock(sdk1, orderId, price)
		expect(order.makeStock.toString()).toEqual(price)

		const updateAction = await sdk2.order.bidUpdate.prepare({
			orderId,
		})
		const updatedOrder = await updateAction.submit({ price: "0.00004" })

		const acceptBidResponse = await sdk1.order.acceptBid.prepare({ orderId: updatedOrder })
		const acceptBidTx = await acceptBidResponse.submit({ amount: 1, infiniteApproval: true })
		await acceptBidTx.wait()

		await retry(10, 1000, async () => {
			return sdk1.apis.ownership.getOwnershipById({
				ownershipId: `${result.itemId}:${bidderAddress}`,
			})
		})
	})

	test("bid on erc721 <-> erc20 and update bid with basic function", async () => {
		const bidderAddress = await ethwallet2.ethereum.getFrom()
		const bidderUnionAddress = convertEthereumToUnionAddress(bidderAddress, Blockchain.ETHEREUM)

		const tx = await sdk2.balances.convert({
			blockchain: Blockchain.ETHEREUM,
			isWrap: true,
			value: "0.000000000004",
		})
		await tx.wait()

		await retry(10, 2000, async () => {
			const balance = await sdk2.balances.getBalance(bidderUnionAddress, {
				"@type": "ERC20",
				contract: wethContract,
			})
			if (new BigNumber(balance).isEqualTo(0)) {
				throw new Error("Balance WETH is zero")
			}
		})

		const result = await sdk1.nft.mint({
			collectionId: convertEthereumCollectionId(erc721Address, Blockchain.ETHEREUM),
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
		})
		await result.transaction.wait()

		await awaitItem(sdk1, result.itemId)

		const price = "0.000000000002"
		const orderId = await sdk2.order.bid({
			itemId: result.itemId,
			amount: 1,
			price,
			currency: {
				"@type": "ERC20",
				contract: wethContract,
			},
			originFees: [{
				account: bidderUnionAddress,
				value: 1000,
			}],
			expirationDate: new Date(Date.now() + 60 * 60 * 1000),
		})

		const order = await awaitStock(sdk1, orderId, price)
		expect(order.makeStock.toString()).toEqual(price)

		const updatedOrderId = await sdk2.order.bidUpdate({
			orderId,
			price: "0.000000000004",
		})

		const acceptBidTx = await sdk1.order.acceptBid({
			orderId: updatedOrderId,
			amount: 1,
		})
		await acceptBidTx.wait()

		await retry(10, 1000, async () => {
			return sdk1.apis.ownership.getOwnershipById({
				ownershipId: `${result.itemId}:${bidderAddress}`,
			})
		})
	})

	test("bid on erc-1155, convert to weth and update bid", async () => {
		// const itemOwner = await ethwallet1.ethereum.getFrom()

		const bidderAddress = await ethwallet2.ethereum.getFrom()
		const bidderUnionAddress = convertEthereumToUnionAddress(bidderAddress, Blockchain.ETHEREUM)

		const nftMintTx = await sdk1.nft.mint({
			collectionId: e2eErc1155V2ContractAddress,
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			supply: 100,
		})
		await nftMintTx.transaction.wait()
		await awaitItem(sdk1, nftMintTx.itemId)

		await resetWethFunds(ethwallet2, ethSdk2, wethContractEthereum)

		const response = await sdk2.order.bid.prepare({ itemId: nftMintTx.itemId })
		const price = "400"
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
			expirationDate: new Date(Date.now() + 60 * 60 * 1000),
		})

		await awaitStock(sdk1, orderId, "1200")

		const updateAction = await sdk2.order.bidUpdate.prepare({
			orderId,
		})
		const updatedOrderId = await updateAction.submit({ price: "410" })

		const acceptBidResponse = await sdk1.order.acceptBid.prepare({ orderId: updatedOrderId })
		const acceptBidTx = await acceptBidResponse.submit({ amount: 1, infiniteApproval: true })
		await acceptBidTx.wait()

		await retry(10, 1000, async () => {
			return sdk1.apis.ownership.getOwnershipById({
				ownershipId: `${nftMintTx.itemId}:${bidderAddress}`,
			})
		})
	})

	test("getConvertValue returns undefined when passed non-weth contract", async () => {
		// const senderRaw = wallet1.getAddressString()

		const nftMintTx = await sdk1.nft.mint({
			collectionId: e2eErc1155V2ContractAddress,
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			supply: 100,
		})
		await nftMintTx.transaction.wait()

		const bidderAddress = await ethereum2.getFrom()
		const bidderUnionAddress = convertEthereumToUnionAddress(bidderAddress, Blockchain.ETHEREUM)
		await awaitItem(sdk2, nftMintTx.itemId)

		await resetWethFunds(ethwallet2, ethSdk2, wethContractEthereum)
		//todo uncomment
		// await awaitBalance(sdk2, wethAsset, ethwallet2, "0")

		const bidResponse = await sdk2.order.bid.prepare({ itemId: nftMintTx.itemId })

		await retry(5, 2000, async () => {
			const value = await bidResponse.getConvertableValue({
				assetType: {
					"@type": "ERC20",
					contract: convertEthereumContractAddress(testErc20.options.address, Blockchain.ETHEREUM),
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
		const value = await bidResponse.getConvertableValue({
			currencyId: toCurrencyId(`ETHEREUM:${testErc20.options.address}`),
			price: "0.00000000000000001",
			amount: 5,
			originFees: [{
				account: bidderUnionAddress,
				value: 1000,
			}],
		})
		expect(value).toBe(undefined)
	})

	test("getConvertValue returns insufficient type", async () => {
		const mintResult = await sdk1.nft.mint({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			collectionId: e2eErc1155V2ContractAddress,
		})
		await awaitItem(nullFundsSdk, mintResult.itemId)

		const bidResponse = await nullFundsSdk.order.bid.prepare({ itemId: mintResult.itemId })
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
		const value = await bidResponse.getConvertableValue({
			currencyId: toCurrencyId(wethContract),
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

	test("getConvertableValue returns undefined", async () => {
		const itemId = toItemId(`${Blockchain.ETHEREUM}:0x2Ac19979c171F7b626096C9eDc8Cd5C589cf110b:1`)

		const bidResponse = await sdk2.order.bid.prepare({ itemId })

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

	//todo enable when it will works
	test.skip("getConvertableValue returns convertable value", async () => {
		const itemId = toItemId(`${Blockchain.ETHEREUM}:0x2Ac19979c171F7b626096C9eDc8Cd5C589cf110b:1`)

		const bidResponse = await sdk2.order.bid.prepare({ itemId })

		await resetWethFunds(ethwallet2, ethSdk2, wethContractEthereum)
		//todo uncomment
		// await awaitBalance(sdk2, wethAsset, ethwallet2, "0")

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

	test("collection bid", async () => {
		const nftMintTx = await sdk1.nft.mint({
			collectionId: e2eErc721ContractAddress,
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
		})
		await nftMintTx.transaction.wait()

		await awaitItem(sdk1, nftMintTx.itemId)

		const bidResponse = await sdk2.order.bid.prepare({
			collectionId: e2eErc721ContractAddress,
		})

		const erc20Contract = convertEthereumContractAddress(testErc20.options.address, Blockchain.ETHEREUM)
		const bidOrderId = await bidResponse.submit({
			amount: 1,
			price: "0.00000000000001",
			currency: {
				"@type": "ERC20",
				contract: erc20Contract,
			},
			expirationDate: new Date(Date.now() + 1000 * 60 * 10),
		})

		const acceptBidResponse = await sdk1.order.acceptBid.prepare({
			orderId: bidOrderId,
		})
		const fillBidResult = await acceptBidResponse.submit({
			amount: 1,
			infiniteApproval: true,
			itemId: nftMintTx.itemId,
		})
		await fillBidResult.wait()
	})

	test("bid on erc721 <-> erc20 with CurrencyId", async () => {
		// const itemOwner = await ethwallet1.ethereum.getFrom()

		const bidderAddress = await ethwallet2.ethereum.getFrom()
		const bidderUnionAddress = convertEthereumToUnionAddress(bidderAddress, Blockchain.ETHEREUM)

		const nftMintTx = await sdk1.nft.mint({
			collectionId: e2eErc721ContractAddress,
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
		})
		await nftMintTx.transaction.wait()

		await awaitItem(sdk1, nftMintTx.itemId)

		await resetWethFunds(ethwallet2, ethSdk2, wethContractEthereum)

		const response = await sdk2.order.bid.prepare({ itemId: nftMintTx.itemId })
		const price = "0.000000000000002"
		const erc20Contract = convertEthereumContractAddress(testErc20.options.address, Blockchain.ETHEREUM)
		const orderId = await response.submit({
			amount: 1,
			price,
			currency: toCurrencyId(erc20Contract),
			originFees: [{
				account: bidderUnionAddress,
				value: 1000,
			}],
			expirationDate: new Date(Date.now() + 60 * 60 * 1000),
		})

		const order = await awaitStock(sdk1, orderId, price)
		expect(order.makeStock.toString()).toEqual(price)
		const takeAssetType = order.make.type as EthErc20AssetType
		expect(takeAssetType["@type"]).toEqual("ERC20")
		expect(takeAssetType.contract.toLowerCase()).toEqual(erc20Contract.toLowerCase())

		const acceptBidResponse = await sdk1.order.acceptBid.prepare({ orderId })
		const acceptBidTx = await acceptBidResponse.submit({ amount: 1, infiniteApproval: true })
		await acceptBidTx.wait()

		await retry(10, 1000, async () => {
			return sdk1.apis.ownership.getOwnershipById({
				ownershipId: `${nftMintTx.itemId}:${bidderAddress}`,
			})
		})
	})


	test.skip("bid for collection with outdated expiration date", async () => {
		const ownerCollectionAddress = await ethereum1.getFrom()
		const bidderAddress = await ethereum2.getFrom()

		const mintResult = await sdk1.nft.mint({
			uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			collectionId: toCollectionId(erc721Address),
		})

		await sentTxConfirm(testErc20.methods.mint(bidderAddress, "10000000000000"), {
			from: ownerCollectionAddress,
			gas: 500000,
		})
		await awaitItem(sdk1, mintResult.itemId)

		const bidResponse = await sdk2.order.bid.prepare({
			collectionId: toCollectionId(erc721Address),
		})

		const erc20Contract = convertEthereumContractAddress(testErc20.options.address, Blockchain.ETHEREUM)
		const bidOrderId = await bidResponse.submit({
			amount: 1,
			price: "0.00000000000000001",
			currency: {
				"@type": "ERC20",
				contract: erc20Contract,
			},
			expirationDate: new Date(),
		})

		const acceptBidResponse = await sdk1.order.acceptBid.prepare({
			orderId: bidOrderId,
		})
		let errorMessage
		try {
			const fillBidResult = await acceptBidResponse.submit({
				amount: 1,
				infiniteApproval: true,
				itemId: mintResult.itemId,
			})
			await fillBidResult.wait()
		} catch (e: any) {
			errorMessage = e.message
		}
		expect(errorMessage).toBeTruthy()
	})

	test.skip("bid for collection and accept bid on lazy item", async () => {
		const ownerCollectionAddress = await ethereum1.getFrom()
		const bidderAddress = await ethereum2.getFrom()

		await sentTxConfirm(testErc20.methods.mint(bidderAddress, "10000000000000"), {
			from: ownerCollectionAddress,
			gas: 500000,
		})

		const action = await sdk1.nft.mint.prepare({ collectionId: e2eErc1155V2ContractAddress })

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
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		await awaitItem(sdk1, mintResult.itemId)

		const bidResponse = await sdk2.order.bid.prepare({
			collectionId: e2eErc1155V2ContractAddress,
		})

		const erc20Contract = convertEthereumContractAddress(testErc20.options.address, Blockchain.ETHEREUM)
		const bidOrderId = await bidResponse.submit({
			amount: 10,
			price: "0.00000000000000001",
			currency: {
				"@type": "ERC20",
				contract: erc20Contract,
			},
		})

		const acceptBidResponse = await sdk1.order.acceptBid.prepare({
			orderId: bidOrderId,
		})

		const fillBidResult = await acceptBidResponse.submit({
			amount: 10,
			infiniteApproval: true,
			itemId: mintResult.itemId,
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
