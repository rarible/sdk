import {
	awaitAll,
	createGanacheProvider, deployErc20TransferProxy,
	deployTestErc1155,
	deployTestErc20,
	deployTestErc721, deployTestExchangeV2, deployTestExchangeWrapper, deployTestRoyaltiesProvider, deployTransferProxy,
} from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { randomWord, toAddress, toBigNumber, ZERO_ADDRESS } from "@rarible/types"
import type { Address, Asset } from "@rarible/ethereum-api-client"
import { toBn } from "@rarible/utils/build/bn"
import type { BigNumber } from "@rarible/utils"
import type { EthereumNetwork } from "../../../types"
import type { EthereumConfig } from "../../../config/type"
import { getEthereumConfig } from "../../../config"
import { id32 } from "../../../common/id"
import { createEthereumApis } from "../../../common/apis"
import { checkChainId } from "../../check-chain-id"
import { getSimpleSendWithInjects, sentTx } from "../../../common/send-transaction"
import type { SimpleRaribleV2Order } from "../../types"
import { signOrder } from "../../sign-order"
import { BatchOrderFiller } from "./batch-purchase"

describe.skip("fillOrder: Opensea orders", function () {
	const { addresses, provider } = createGanacheProvider()
	const [sender1Address, sender2Address] = addresses
	const web3 = new Web3(provider as any)
	const ethereum1 = new Web3Ethereum({ web3, from: sender1Address, gas: 1000000 })
	const ethereum2 = new Web3Ethereum({ web3, from: sender2Address, gas: 1000000 })

	const env: EthereumNetwork = "dev-ethereum"
	const config: EthereumConfig = {
		...getEthereumConfig(env),
		openSea: {
			metadata: id32("RARIBLE"),
			proxyRegistry: ZERO_ADDRESS,
		},
	}
	const apis = createEthereumApis(env)

	const getBaseOrderFee = async () => 100
	const checkWalletChainId1 = checkChainId.bind(null, ethereum1, config)
	// const checkWalletChainId2 = checkChainId.bind(null, ethereum2, config)

	const send1 = getSimpleSendWithInjects().bind(null, checkWalletChainId1)

	const orderFiller = new BatchOrderFiller(ethereum1, send1, config, apis, getBaseOrderFee, env)

	const it = awaitAll({
		testErc20: deployTestErc20(web3, "Test1", "TST1"),
		testErc721: deployTestErc721(web3, "Test", "TST"),
		testErc1155: deployTestErc1155(web3, "Test"),
		exchangeWrapper: deployTestExchangeWrapper(web3),
		transferProxy: deployTransferProxy(web3),
		erc20TransferProxy: deployErc20TransferProxy(web3),
		royaltiesProvider: deployTestRoyaltiesProvider(web3),
		exchangeV2: deployTestExchangeV2(web3),
	})

	beforeAll(async () => {
		await sentTx(
			it.exchangeV2.methods.__ExchangeV2_init(
				toAddress(it.transferProxy.options.address!),
				toAddress(it.erc20TransferProxy.options.address!),
				toBigNumber("100"),
				sender1Address,
				toAddress(it.royaltiesProvider.options.address!)
			),
			{ from: sender1Address }
		)

		await sentTx(it.transferProxy.methods.addOperator(toAddress(it.exchangeV2.options.address!)), {
			from: sender1Address,
		})
		await sentTx(it.erc20TransferProxy.methods.addOperator(toAddress(it.exchangeV2.options.address!)), {
			from: sender1Address,
		})
		await sentTx(
			it.exchangeWrapper.methods.__ExchangeWrapper_init(
				ZERO_ADDRESS,
				it.exchangeV2.options.address!,
			),
			{ from: sender1Address }
		)
		config.exchange.wrapper = toAddress(it.exchangeWrapper.options.address!)
		config.exchange.v1 = toAddress(it.exchangeV2.options.address!)
		config.exchange.v2 = toAddress(it.exchangeV2.options.address!)
		config.transferProxies.erc20 = toAddress(it.erc20TransferProxy.options.address!)
		config.exchange.wrapper = toAddress(it.exchangeWrapper.options.address!)
		// config.chainId = 17
	})

	function getOrder(asset: Asset, owner: Address): SimpleRaribleV2Order {
		if (asset.assetType.assetClass !== "ERC721" && asset.assetType.assetClass !== "ERC1155") {
			throw new Error("Wrong asset")
		}
		return  {
			make: {
				assetType: {
					assetClass: asset.assetType.assetClass,
					contract: toAddress(asset.assetType.contract),
					tokenId: toBigNumber(asset.assetType.tokenId),
				},
				value: toBigNumber(asset.value),
			},
			maker: owner,
			taker: ZERO_ADDRESS,
			take: {
				assetType: {
					assetClass: "ETH",
				},
				value: toBigNumber("1000000"),
			},
			salt: randomWord(),
			type: "RARIBLE_V2",
			data: {
				dataType: "RARIBLE_V2_DATA_V1",
				payouts: [],
				originFees: [],
			},
		}
	}

	async function mintTestAssetAndReturnOrder(
		asset: Asset, sender: Address, receiver: Address
	): Promise<SimpleRaribleV2Order> {
		switch (asset.assetType.assetClass) {
			case "ERC721": {
				await sentTx(it.testErc721.methods.mint(receiver, asset.assetType.tokenId, "0x"), { from: sender })
				await sentTx(it.testErc721.methods.setApprovalForAll(it.transferProxy.options.address!, true), {
					from: receiver,
				})
				break
			}
			case "ERC1155": {
				await sentTx(it.testErc1155.methods.mint(receiver, asset.assetType.tokenId, "0x" + toBn(asset.value).multipliedBy(10).toString(16), "0x"), { from: sender })
				await sentTx(it.testErc1155.methods.setApprovalForAll(it.transferProxy.options.address!, true), {
					from: receiver,
				})
				break
			}
			default:
		}
		const order = getOrder(asset, receiver)
		return { ...order, signature: await signOrder(ethereum2, config, order) }
	}

	async function getBalance(assetType: "ERC721" | "ERC1155", userAddress: Address, tokenId?: string): Promise<BigNumber> {
		switch (assetType) {
			case "ERC721": {
				return toBn(await it.testErc721.methods.balanceOf(userAddress).call())
			}
			case "ERC1155": {
				if (!tokenId) throw new Error("getBalance: tokenId")
				return toBn(await it.testErc1155.methods.balanceOf(userAddress, toBn(tokenId).toString(16)).call())
			}
			default: throw new Error("Should never happen")
		}
	}

	test("Match batch of rarible-v2 orders", async () => {
		const tokenIds = ["3", "4", "5"]

		const order1 = await mintTestAssetAndReturnOrder({
			assetType: {
				assetClass: "ERC1155",
				contract: toAddress(it.testErc1155.options.address!),
				tokenId: toBigNumber(tokenIds[0]),
			},
			value: toBigNumber("2"),
		}, sender1Address, sender2Address)

		const order2 = await mintTestAssetAndReturnOrder({
			assetType: {
				assetClass: "ERC1155",
				contract: toAddress(it.testErc1155.options.address!),
				tokenId: toBigNumber(tokenIds[1]),
			},
			value: toBigNumber("2"),
		}, sender1Address, sender2Address)

		const order3 = await mintTestAssetAndReturnOrder({
			assetType: {
				assetClass: "ERC721",
				contract: toAddress(it.testErc721.options.address!),
				tokenId: toBigNumber(tokenIds[2]),
			},
			value: toBigNumber("1"),
		}, sender1Address, sender2Address)

		const beforeBuyerNftBalance1 = await getBalance("ERC1155", sender1Address, tokenIds[0])
		const beforeBuyerNftBalance2 = await getBalance("ERC1155", sender1Address, tokenIds[1])
		const beforeBuyerNftBalance3 = await getBalance("ERC721", sender1Address)
		const beforeSellerNftBalance1 = await getBalance("ERC1155", sender2Address, tokenIds[0])
		const beforeSellerNftBalance2 = await getBalance("ERC1155", sender2Address, tokenIds[1])
		const beforeSellerNftBalance3 = await getBalance("ERC721", sender2Address)

		const tx = await orderFiller.buy([
			{ order: order1, amount: 1 }, //ERC1155 partial fill
			{ order: order2, amount: 2 },
			{ order: order3, amount: 1 },
		])
		await tx.wait()

		//seller balances
		expect((await getBalance("ERC1155", sender2Address, tokenIds[0])).toString()).toBe(
			beforeSellerNftBalance1.minus(1).toFixed()
		)
		expect((await getBalance("ERC1155", sender2Address, tokenIds[1])).toString()).toBe(
			beforeSellerNftBalance2.minus(2).toFixed()
		)
		expect((await getBalance("ERC721", sender2Address)).toString()).toBe(
			beforeSellerNftBalance3.minus(1).toFixed()
		)

		//buyer balances
		expect((await getBalance("ERC1155", sender1Address, tokenIds[0])).toString()).toBe(
			beforeBuyerNftBalance1.plus(1).toFixed()
		)
		expect((await getBalance("ERC1155", sender1Address, tokenIds[1])).toString()).toBe(
			beforeBuyerNftBalance2.plus(2).toFixed()
		)
		expect((await getBalance("ERC721", sender1Address)).toString()).toBe(
			beforeBuyerNftBalance3.plus(1).toFixed()
		)
	})
})
