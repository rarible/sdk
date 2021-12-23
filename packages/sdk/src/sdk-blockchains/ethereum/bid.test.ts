import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { deployTestErc20 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc20"
import { deployTestErc721 } from "@rarible/protocol-ethereum-sdk/build/order/contracts/test/test-erc721"
import { toContractAddress, toItemId, toOrderId, toUnionAddress } from "@rarible/types"
import BigNumber from "bignumber.js"
import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk } from "../../index"
import { retry } from "../../common/retry"
import { initProviders } from "./test/init-providers"
import { awaitItem } from "./test/await-item"
import { awaitStock } from "./test/await-stock"
import { convertEthereumUnionAddress } from "./common"

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

	const wethContract = toContractAddress(`${Blockchain.ETHEREUM}:0xc6f33b62a94939e52e1b074c4ac1a801b869fdb2`)

	const it = awaitAll({
		testErc20: deployTestErc20(web31, "Test1", "TST1"),
		testErc721: deployTestErc721(web31, "Test2", "TST2"),
	})

	test("bid on erc721 and update bid", async () => {
		const senderRaw = wallet1.getAddressString()

		const tokenId = "1"
		const itemId = toItemId(
			`ETHEREUM:${it.testErc721.options.address}:${tokenId}`
		)
		await it.testErc721.methods.mint(senderRaw, tokenId, "123").send({
			from: senderRaw,
			gas: 500000,
		})
		await it.testErc20.methods.mint(senderRaw, 100).send({
			from: senderRaw,
			gas: 500000,
		})

		await awaitItem(sdk1, itemId)

		const response = await sdk1.order.bid({ itemId })
		const price = "0.000000000000000002"
		const orderId = await response.submit({
			amount: 1,
			price,
			currency: {
				"@type": "ERC20",
				contract: toContractAddress(`ETHEREUM:${it.testErc20.options.address}`),
			},
		})

		const order = await awaitStock(sdk1, orderId, price)
		expect(order.makeStock.toString()).toEqual(price)

		const updateAction = await sdk1.order.bidUpdate({
			orderId: toOrderId(orderId),
		})
		await updateAction.submit({ price: "0.000000000000000004" })
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
			convertEthereumUnionAddress(wallet1.getAddressString()),
		)


		expect(value).not.toBe(undefined)

		if (value) {
			expect(value.value.toString()).toBe("0.00001")
			expect(value.type).toBe("insufficient")
		}

	})

	test("convertCurrency ETH to WETH", async () => {
		const senderRaw = wallet2.getAddressString()
		const senderUnionAddress = toUnionAddress(`ETHEREUM:${senderRaw}`)
		const itemId = toItemId(`${Blockchain.ETHEREUM}:0xF04881F205644925596Fee9D66DACd98A9b99F05:1`)

		const bidResponse = await sdk2.order.bid({ itemId })

		const wethInitBalance = await sdk2.balances.getBalance(
			senderUnionAddress,
			{ "@type": "ERC20", contract: wethContract }
		)
		const convertTx = await bidResponse.convert(
			{ "@type": "ETH" },
			{ "@type": "ERC20", contract: wethContract },
			"0.000000000000001"
		)

		await convertTx.wait()

		await retry(10, 1000, async () => {

			const wethFinishBalance = await sdk2.balances.getBalance(
				senderUnionAddress,
				{ "@type": "ERC20", contract: wethContract }
			)

			expect(
				new BigNumber(wethFinishBalance).minus(wethInitBalance).toString()
			).toEqual("0.000000000000001")
		})
	})

	test("getConvertableValue returns undefined", async () => {
		const itemId = toItemId(`${Blockchain.ETHEREUM}:0xF04881F205644925596Fee9D66DACd98A9b99F05:1`)

		const bidResponse = await sdk2.order.bid({ itemId })
		const convertTx = await bidResponse.convert(
			{ "@type": "ETH" },
			{ "@type": "ERC20", contract: wethContract },
			"0.000000000000001"
		)
		await convertTx.wait()

		const value = await bidResponse.getConvertableValue(
			{ "@type": "ERC20", contract: wethContract },
			"0.000000000000001",
			convertEthereumUnionAddress(wallet2.getAddressString())
		)

		expect(value).toBe(undefined)
	})
})
