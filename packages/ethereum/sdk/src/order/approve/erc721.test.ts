import { toAddress, toBigNumber } from "@rarible/types"
import { createGanacheProvider, deployTestErc721 } from "@rarible/ethereum-sdk-test-common"
import type { Web3Ethereum } from "@rarible/web3-ethereum"
import type { Address, Erc721AssetType } from "@rarible/ethereum-api-client"
import type { BigNumberValue } from "@rarible/utils"
import type { Asset } from "@rarible/ethereum-api-client"
import { sentTx, getSendWithInjects } from "../../common/send-transaction"
import { createTestAdapters } from "../../common/test/provider-adapters"
import { getEthereumConfig } from "../../config"
import { ConfigService } from "../../common/config"
import { Erc721Handler } from "./erc721"

const { provider, wallets, addresses } = createGanacheProvider()
const adapters = createTestAdapters(provider, wallets[0])
const owner = toAddress(addresses[0])

describe.each(adapters.cases)("approveErc721", ({ adapter }) => {
	const config = getEthereumConfig("dev-ethereum")
	const sendFn = getSendWithInjects()

	test(`[${adapter.constructor.name}] should approve`, async () => {
		const {
			tokenId,
			contractAddress,
		} = await deployErc721AndMintTokens(adapters.web3, owner)
		const configService = new ConfigService(config.network, adapter)
		const handler = new Erc721Handler(sendFn, configService)

		const erc721Asset = getErc721Asset(contractAddress, tokenId)

		const tx = await handler.approve(owner, erc721Asset, false)
		if (!tx) throw new Error("Expected a transaction")
		await tx.wait()

		const allowance = await handler.getAllowance(adapter, contractAddress, owner)
		expect(allowance).toBeTruthy()
	})

	test(`[${adapter.constructor.name}] should not approve if already approved`, async () => {
		const configService = new ConfigService(config.network, adapter)
		const currentConfig = await configService.getCurrentConfig()
		const {
			tokenId,
			contractAddress,
		} = await deployErc721AndMintWithApprovalTokens(adapters.web3, owner, currentConfig.transferProxies.nft)
		const handler = new Erc721Handler(sendFn, configService)

		const erc721Asset = getErc721Asset(contractAddress, tokenId)

		const allowance = await handler.getAllowance(adapter, contractAddress, owner)
		expect(allowance).toBeTruthy()

		const tx = await handler.approve(owner, erc721Asset, false)
		expect(tx === undefined).toBeTruthy()
	})
})

async function deployErc721AndMintTokens(ethereum: Web3Ethereum, minter: Address) {
	const erc721Contract = await deployTestErc721(ethereum.getWeb3Instance(), "TST", "TST")

	const tokenId = "0x1"
	const uri = "https://example.com"
	await erc721Contract.methods
		.mint(minter, tokenId, uri)
		.send({ from: minter, gas: 1000000 })

	return {
		erc721Contract,
		contractAddress: toAddress(erc721Contract.options.address),
		tokenId,
	}
}

async function deployErc721AndMintWithApprovalTokens(
	ethereum: Web3Ethereum,
	minter: Address,
	operator: Address
) {
	const { erc721Contract, tokenId } = await deployErc721AndMintTokens(ethereum, minter)
	await sentTx(erc721Contract.methods.setApprovalForAll(operator, true), { from: minter })

	return {
		erc721Contract,
		contractAddress: toAddress(erc721Contract.options.address),
		tokenId,
	}
}

function getErc721Asset(contract: Address, tokenId: BigNumberValue): Asset {
	const erc721Asset: Erc721AssetType = {
		assetClass: "ERC721",
		contract,
		tokenId: toBigNumber(tokenId.toString()),
	}
	return {
		assetType: erc721Asset,
		value: toBigNumber("1"),
	}
}
