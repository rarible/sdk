import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { randomAddress, toCurrencyId, toUnionAddress, ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import BigNumber from "bignumber.js"
import { createSdk } from "../../common/test/create-sdk"
import { initProviders } from "./test/init-providers"
import { convertEthereumToUnionAddress } from "./common"
import { DEV_PK_1, POLYGON_TESTNET_SETTINGS } from "./test/common"
import { EVMContractsTestSuite } from "./test/suite/contracts"
import { ERC20Mintable } from "./test/suite/contracts/variants/erc20-mintable"
import { ERC20 } from "./test/suite/contracts/variants/erc20"
import type { EVMTestSuite } from "./test/suite"
import { EVMTestSuiteFactory } from "./test/suite"
import { EVMNativeToken } from "./test/suite/contracts/variants/native"

describe("get balance", () => {
	const suiteFactoryETH = new EVMTestSuiteFactory(Blockchain.ETHEREUM)
	const suiteFactoryPolygon = new EVMTestSuiteFactory(Blockchain.POLYGON)
	let suiteDevETH: EVMTestSuite<Blockchain.ETHEREUM>
	let suiteDevPolygon: EVMTestSuite<Blockchain.POLYGON>

	beforeAll(async () => {
		suiteDevETH = await suiteFactoryETH.create(DEV_PK_1)
		suiteDevPolygon = await suiteFactoryPolygon.create(DEV_PK_1)
	})

	afterAll(() => {
		suiteDevETH.destroy()
		suiteDevPolygon.destroy()
	})

	const { web31, wallet1 } = initProviders({
		pk1: DEV_PK_1,
	})

	const ethereum = new Web3Ethereum({
		web3: web31,
		from: wallet1.getAddressString(),
	})
	const testSuite = new EVMContractsTestSuite(
		Blockchain.ETHEREUM,
		ethereum
	)

	test("should be the same ERC-20 balance from contract/api", async () => {
		const erc20Contract = await ERC20Mintable.deploy(Blockchain.ETHEREUM, ethereum)
		const generatedAddress = randomAddress()
		await erc20Contract.mint(1, generatedAddress)
		const erc20ContractBalance = await erc20Contract.fromWei(await erc20Contract.balanceOf(generatedAddress))
		//With AssetType
		await suiteDevETH.balances.waitBalance(
			ERC20.getAssetType(erc20Contract.contractAddress),
			erc20ContractBalance,
			convertEthereumToUnionAddress(generatedAddress),
		)
		//With CurrencyId
		await suiteDevETH.balances.waitBalance(
			toCurrencyId(erc20Contract.contractAddress),
			erc20ContractBalance,
			convertEthereumToUnionAddress(generatedAddress),
		)
	})

	describe("get ETH balance with different request currencies", () => {
		const generatedAddress = randomAddress()
		const sponsorAmount = "0.00019355"

		beforeAll(async () =>
			await suiteDevETH.sponsor(generatedAddress, sponsorAmount)
		)

		test.each([
			{ currency: EVMNativeToken.assetType, label: "Asset type" },
			{ currency: EVMNativeToken.getCurrency(), label: "CurrencyID" },
		])("$label", async ({ currency }) => {
			await suiteDevETH.balances.waitBalance(
				currency,
				sponsorAmount,
				convertEthereumToUnionAddress(generatedAddress),
			)
		})
	})

	describe("get Polygon balance", () => {
		const generatedAddress = randomAddress()
		const sponsorAmount = "0.00019355"

		beforeAll(async () => {
		  await suiteDevPolygon.sponsor(generatedAddress, sponsorAmount)
		})

		test.each([
			{ currency: EVMNativeToken.getAssetType(Blockchain.POLYGON), label: "Asset type" },
			{ currency: EVMNativeToken.getCurrency(Blockchain.POLYGON), label: "CurrencyID" },
		])("$label", async ({ currency }) => {
			await suiteDevPolygon.balances.waitBalance(
				currency,
				sponsorAmount,
				convertEthereumToUnionAddress(generatedAddress),
			)
		})
	})

	describe("ETH <-> wETH convertation",  () => {
		const wethContract = testSuite.getContract("wrapped_eth")

		test("ETH -> wETH", async () => {
			const startBalance = await suiteDevETH.sdk.balances.getBalance(
				suiteDevETH.addressUnion,
				wethContract.assetType
			)
			await suiteDevETH.balances.convertToWeth("0.00035")

			await suiteDevETH.balances.waitBalance(
				wethContract.assetType,
				toBn(startBalance).plus("0.00035"),
			)
		})

		test("wETH -> ETH", async () => {
			const wethContract = testSuite.getContract("wrapped_eth")
			const startBalance = await suiteDevETH.sdk.balances.getBalance(
				suiteDevETH.addressUnion,
				wethContract.assetType
			)
			await suiteDevETH.balances.convertFromWeth("0.00035")

			await suiteDevETH.balances.waitBalance(
				wethContract.assetType,
				toBn(startBalance).minus("0.00035"),
			)
		})
	})
})

describe("get polygon balance", () => {
	const { web31, wallet1 } = initProviders({
		pk1: "ded057615d97f0f1c751ea2795bc4b03bbf44844c13ab4f5e6fd976506c276b9",
	}, POLYGON_TESTNET_SETTINGS)

	const ethereum = new Web3Ethereum({
		web3: web31,
		from: wallet1.getAddressString(),
	})

	const sdk = createSdk(new EthereumWallet(ethereum), "testnet")

	test.concurrent("get Matic balance", async () => {
		const walletAddress = toUnionAddress("ETHEREUM:0xc8f35463Ea36aEE234fe7EFB86373A78BF37e2A1")
		const balance = await sdk.balances.getBalance(walletAddress, {
			"@type": "ETH",
			blockchain: Blockchain.POLYGON,
		})
		expect(balance.toString()).toEqual("0.009145")
	})

	test.concurrent("get Matic balance with CurrencyId", async () => {
		const walletAddress = toUnionAddress("ETHEREUM:0xc8f35463Ea36aEE234fe7EFB86373A78BF37e2A1")
		const currency = toCurrencyId(`POLYGON:${ZERO_ADDRESS}`)
		const balance = await sdk.balances.getBalance(walletAddress, currency)
		expect(balance.toString()).toEqual("0.009145")
	})
})

describe.skip("Bidding balance", () => {
	const { web31, wallet1 } = initProviders({
		pk1: "ded057615d97f0f1c751ea2795bc4b03bbf44844c13ab4f5e6fd976506c276b9",
	})

	const ethereum = new Web3Ethereum({ web3: web31 })
	const wallet = new EthereumWallet(ethereum)
	const sdk = createSdk(wallet, "development")

	test("Should check bidding balance & deposit & withdraw", async () => {
		const checkBalance = async (expecting: BigNumberValue | null) => {
			const balance = await sdk.balances.getBiddingBalance({
				blockchain: Blockchain.ETHEREUM,
				walletAddress: toUnionAddress("ETHEREUM:" + wallet1.getAddressString()),
			})
			if (expecting !== null) {
				expect(parseFloat(balance.toString())).toBeCloseTo(parseFloat(expecting.toString()), 5)
			}
			return balance
		}

		const initBalance = new BigNumber(await checkBalance(null))

		await checkBalance(initBalance)

		let tx = await sdk.balances.depositBiddingBalance({ amount: 0.005, blockchain: Blockchain.ETHEREUM })
		await tx.wait()

		const remainBalance = await checkBalance(new BigNumber(initBalance).plus(0.005))

		tx = await sdk.balances.withdrawBiddingBalance({ amount: remainBalance, blockchain: Blockchain.ETHEREUM })
		await tx.wait()

		await checkBalance(0)
	})
})
