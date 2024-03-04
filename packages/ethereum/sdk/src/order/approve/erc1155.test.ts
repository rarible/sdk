import { toAddress, toBigNumber } from "@rarible/types"
import { toBn } from "@rarible/utils"
import { createGanacheProvider, deployTestErc1155 } from "@rarible/ethereum-sdk-test-common"
import type { Web3Ethereum } from "@rarible/web3-ethereum"
import type { Address, Erc1155AssetType, Asset } from "@rarible/ethereum-api-client"
import type { BigNumberValue } from "@rarible/utils"
import { createTestAdapters } from "../../common/test/provider-adapters"
import { getEthereumConfig } from "../../config"
import { ConfigService } from "../../common/config"
import { getSendWithInjects, sentTx } from "../../common/send-transaction"
import { Erc1155Handler } from "./erc1155"

const { provider, wallets, addresses } = createGanacheProvider()
const adapters = createTestAdapters(provider, wallets[0])
const owner = toAddress(addresses[0])
describe.each(adapters.cases)("approveErc1155", ({ adapter }) => {
	const config = getEthereumConfig("dev-ethereum")
	const sendFn = getSendWithInjects()

	test(`[${adapter.constructor.name}] should approve`, async () => {
		const {
			tokenId,
			amount,
			contractAddress,
		} = await deployErc1155AndMintTokens(adapters.web3, owner)
		const configService = new ConfigService(config.network, adapter)
		const handler = new Erc1155Handler(sendFn, configService)

		const erc1155Asset = getErc1155Asset(contractAddress, tokenId, amount)
		const transaction = await handler.approve(owner, erc1155Asset, false)
		if (!transaction) throw new Error("Expected a transaction")
		await transaction.wait()

		const allowance = await handler.getAllowance(adapter, contractAddress, owner)
		expect(allowance).toBeTruthy()
	})

	test(`[${adapter.constructor.name}] should not approve if already approved`, async () => {
		const configService = new ConfigService(config.network, adapter)
		const currentConfig = await configService.getCurrentConfig()
		const {
			tokenId,
			amount,
			contractAddress,
		} = await deployErc1155AndMintWithApprovalTokens(adapters.web3, owner, currentConfig.transferProxies.nft)

		const handler = new Erc1155Handler(sendFn, configService)

		const erc1155Asset = getErc1155Asset(contractAddress, tokenId, amount)
		const allowance = await handler.getAllowance(adapter, contractAddress, owner)
		expect(allowance).toBeTruthy()

		const transaction = await handler.approve(owner, erc1155Asset, false)
		expect(transaction === undefined).toBeTruthy()
	})
})

async function deployErc1155AndMintTokens(ethereum: Web3Ethereum, minter: Address, amount = 5) {
	const erc1155Contract = await deployTestErc1155(ethereum.getWeb3Instance(), "TST")
	const tokenId = "0x1"
	const data = "0x"
	await erc1155Contract.methods
		.mint(minter, tokenId, amount, data)
		.send({ from: minter, gas: 200000 })

	return {
		erc1155Contract,
		contractAddress: toAddress(erc1155Contract.options.address),
		tokenId,
		amount,
	}
}

async function deployErc1155AndMintWithApprovalTokens(
	ethereum: Web3Ethereum,
	minter: Address,
	operator: Address,
	amount = 5) {
	const { erc1155Contract, tokenId } = await deployErc1155AndMintTokens(ethereum, minter, amount)
	await sentTx(erc1155Contract.methods.setApprovalForAll(operator, true), { from: minter })

	return {
		erc1155Contract,
		contractAddress: toAddress(erc1155Contract.options.address),
		tokenId,
		amount,
	}
}

function getErc1155Asset(contract: Address, tokenId: BigNumberValue, amount: BigNumberValue): Asset {
	const erc1155Asset: Erc1155AssetType = {
		assetClass: "ERC1155",
		contract,
		tokenId: toBigNumber(tokenId.toString()),
	}
	return {
		assetType: erc1155Asset,
		value: toBigNumber(toBn(amount).toFixed()),
	}
}
