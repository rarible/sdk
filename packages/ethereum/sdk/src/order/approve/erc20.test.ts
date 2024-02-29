import { toBigNumber, toAddress } from "@rarible/types"
import { deployTestErc20 } from "@rarible/ethereum-sdk-test-common"
import type { Address, Asset, Erc20AssetType } from "@rarible/ethereum-api-client"
import type { Web3Ethereum } from "@rarible/web3-ethereum"
import type { BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import { getSendWithInjects } from "../../common/send-transaction"
import { createTestAdapters } from "../../common/test/provider-adapters"
import { createSponsorProvider } from "../../common/test/provider"
import { getEthereumConfig } from "../../config"
import { ConfigService } from "../../common/config"
import { Erc20Handler } from "./erc20"

describe("Erc20Handler", () => {
	const config = getEthereumConfig("dev-ethereum")
	const sponsor = createSponsorProvider(config.network)
	const ownerAddress = toAddress(sponsor.wallet.getAddressString())
	const adapters = createTestAdapters(sponsor.provider, sponsor.wallet)
	const sendFn = getSendWithInjects()

	test.each(adapters.cases)("should successfully send approval tx with $type", async ({ adapter }) => {
		const configService = new ConfigService(config.network, adapter)
		const handler = new Erc20Handler(config.transferProxies.erc20, sendFn, configService)
		const erc20Contract = await deployErc20AndMintTokens(adapters.web3, ownerAddress)
		const erc20ContractAddress = toAddress(erc20Contract.options.address)
		const allowance = toBn(10)
		const erc20Asset = getErc20Asset(erc20ContractAddress, allowance)

		const transaction = await handler.approve(ownerAddress, erc20Asset, false)
		if (!transaction) throw new Error("Expected a transaction")
		await transaction.wait()

		const nextAllowance = await handler.getAllowance(adapter, erc20ContractAddress, ownerAddress)
		expect(nextAllowance.eq(allowance)).toBeTruthy()
	})

	test("should return undefined in case of sufficiency and otherwise if not", async () => {
		const configService = new ConfigService(config.network, adapters.web3)
		const handler = new Erc20Handler(config.transferProxies.erc20, sendFn, configService)
		const erc20Contract = await deployErc20AndMintTokens(adapters.web3, ownerAddress)
		const erc20ContractAddress = toAddress(erc20Contract.options.address)
		const allowance = toBn(10)
		const erc20Asset = getErc20Asset(erc20ContractAddress, allowance)

		const transaction = await handler.approve(ownerAddress, erc20Asset, false)
		if (!transaction) throw new Error("Expected a transaction")
		await transaction.wait()

		const erc20Asset1 = getErc20Asset(erc20ContractAddress, allowance)
		const transaction1 = await handler.approve(ownerAddress, erc20Asset1, false)
		expect(transaction1).toEqual(undefined)

		const nextAllowance = allowance.plus(1)
		const erc20Asset2 = getErc20Asset(erc20ContractAddress, nextAllowance)
		const transaction2 = await handler.approve(ownerAddress, erc20Asset2, false)
		if (!transaction2) throw new Error("Expected a transaction")
		await transaction2.wait()

		const finalAllowance = await handler.getAllowance(adapters.web3, erc20ContractAddress, ownerAddress)
		expect(finalAllowance.eq(nextAllowance)).toBeTruthy()
	})

	test("should return set infinite approval", async () => {
		const configService = new ConfigService(config.network, adapters.web3)
		const handler = new Erc20Handler(config.transferProxies.erc20, sendFn, configService)
		const erc20Contract = await deployErc20AndMintTokens(adapters.web3, ownerAddress)
		const erc20ContractAddress = toAddress(erc20Contract.options.address)
		const allowance = toBn(10)
		const erc20Asset = getErc20Asset(erc20ContractAddress, allowance)

		const transaction = await handler.approve(ownerAddress, erc20Asset, true)
		if (!transaction) throw new Error("Expected a transaction")
		await transaction.wait()

		const finalAllowance = await handler.getAllowance(adapters.web3, erc20ContractAddress, ownerAddress)
		expect(finalAllowance.eq(Erc20Handler.maxApprovalValue)).toBeTruthy()
	})
})

async function deployErc20AndMintTokens(web3: Web3Ethereum, minter: Address, amount = 100) {
	const erc20Contract = await deployTestErc20(web3.getWeb3Instance(), "TST", "TST")

	await erc20Contract.methods
		.mint(minter, amount)
		.send({ from: minter, gas: 200000 })

	return erc20Contract
}

function getErc20Asset(contract: Address, amount: BigNumberValue): Asset {
	const erc20Asset: Erc20AssetType = {
		assetClass: "ERC20",
		contract: contract,
	}
	return {
		assetType: erc20Asset,
		value: toBigNumber(toBn(amount).toFixed()),
	}
}
