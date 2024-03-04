import type { Web3Ethereum } from "@rarible/web3-ethereum"
import { createGanacheProvider, deployCryptoPunks } from "@rarible/ethereum-sdk-test-common"
import { toAddress, toBigNumber } from "@rarible/types"
import type { Address, CryptoPunksAssetType, Asset } from "@rarible/ethereum-api-client"
import { getSendWithInjects } from "../../common/send-transaction"
import { createTestWeb3Adapter } from "../../common/test/provider-adapters"
import { getEthereumConfig } from "../../config"
import { ConfigService } from "../../common/config"
import { CryptoPunkHandler } from "./crypto-punk"

describe("approve crypto punks", () => {
	const { provider, addresses } = createGanacheProvider()
	const ethereum = createTestWeb3Adapter(provider)
	const owner = toAddress(addresses[0])
	const config = getEthereumConfig("dev-ethereum")
	const sendFn = getSendWithInjects()

	test("should approve", async () => {
		const {
			tokenId,
			contractAddress,
		} = await deployCryptoPunksAndMintToken(ethereum, owner)
		const configService = new ConfigService(config.network, ethereum)
		const handler = new CryptoPunkHandler(sendFn, configService)

		const punkAsset = getCryptoPunkAsset(contractAddress, tokenId)
		const transaction = await handler.approve(owner, punkAsset, false)
		if (!transaction) throw new Error("Expected a transaction")
		await transaction.wait()

		const allowance = await handler.getAllowance(ethereum, contractAddress, tokenId, owner)
		expect(allowance).toBeTruthy()
	})

	test("should not approve if already approved", async () => {
		const configService = new ConfigService(config.network, ethereum)
		const currentConfig = await configService.getCurrentConfig()
		const {
			tokenId,
			contractAddress,
		} = await deployPunksAndMintWithApproval(ethereum, owner, currentConfig.transferProxies.cryptoPunks)
		const handler = new CryptoPunkHandler(sendFn, configService)

		const allowance = await handler.getAllowance(ethereum, contractAddress, tokenId, owner)
		expect(allowance).toBeTruthy()

		const punkAsset = getCryptoPunkAsset(contractAddress, tokenId)
		const transaction = await handler.approve(owner, punkAsset, false)
		expect(transaction === undefined).toBeTruthy()
	})
})

async function deployCryptoPunksAndMintToken(ethereum: Web3Ethereum, minter: Address) {
	const cryptoPunkContract = await deployCryptoPunks(ethereum.getWeb3Instance())

	const punkId = 0
	await cryptoPunkContract.methods.allInitialOwnersAssigned()
		.send({ from: minter, gas: 2000000 })
	await cryptoPunkContract.methods.getPunk(punkId)
		.send({ from: minter, gas: 2000000 })
	return {
		cryptoPunkContract,
		tokenId: punkId,
		contractAddress: toAddress(cryptoPunkContract.options.address),
	}
}

async function deployPunksAndMintWithApproval(
	ethereum: Web3Ethereum,
	minter: Address,
	operator: Address
) {
	const {
		cryptoPunkContract,
		tokenId,
		contractAddress,
	} = await deployCryptoPunksAndMintToken(ethereum, minter)
	await cryptoPunkContract.methods.offerPunkForSaleToAddress(tokenId, 0, operator)
		.send({ from: minter, gas: 2000000 })
	return {
		cryptoPunkContract,
		tokenId,
		contractAddress,
	}
}

function getCryptoPunkAsset(contract: Address, tokenId: number): Asset {
	const punkAsset: CryptoPunksAssetType = {
		assetClass: "CRYPTO_PUNKS",
		contract,
		tokenId,
	}
	return {
		assetType: punkAsset,
		value: toBigNumber("1"),
	}
}
