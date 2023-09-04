import { Configuration, NftOwnershipControllerApi } from "@rarible/ethereum-api-client"
import { toAddress, toBigNumber, toWord } from "@rarible/types"
import { awaitAll, createE2eProvider, deployTestErc721 } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { getEthereumConfig } from "../../config"
import { retry } from "../../common/retry"
import { getSimpleSendWithInjects, sentTxConfirm } from "../../common/send-transaction"
import { getApiConfig } from "../../config/api-config"
import { signOrder } from "../sign-order"
import type { SimpleLegacyOrder, SimpleOrder } from "../types"
import { createEthereumApis } from "../../common/apis"
import { checkChainId } from "../check-chain-id"
import { DEV_PK_1, DEV_PK_2 } from "../../common/test/test-credentials"
import { OrderFiller } from "./"

describe.skip("test exchange v1 order", () => {
	const { provider: provider1, wallet: wallet1 } = createE2eProvider(DEV_PK_1)
	const { provider: provider2, wallet: wallet2 } = createE2eProvider(DEV_PK_2)
	const web31 = new Web3(provider1)
	const web32 = new Web3(provider2)
	const sellerEthereum = new Web3Ethereum({ web3: web31 })
	const buyerEthereum = new Web3Ethereum({ web3: web32 })

	const configuration = new Configuration(getApiConfig("dev-ethereum"))
	const ownershipApi = new NftOwnershipControllerApi(configuration)

	const apis = createEthereumApis("dev-ethereum")
	const config = getEthereumConfig("dev-ethereum")

	const getBaseOrderFee = async () => 0
	const checkWalletChainId2 = checkChainId.bind(null, buyerEthereum, config)
	const send2 = getSimpleSendWithInjects().bind(null, checkWalletChainId2)
	const filler = new OrderFiller(buyerEthereum, send2, config, apis, getBaseOrderFee, "dev-ethereum")

	const seller = toAddress(wallet1.getAddressString())
	const buyer = toAddress(wallet2.getAddressString())

	const it = awaitAll({
		testErc721: deployTestErc721(web31, "Test", "TST"),
	})

	const sign = signOrder.bind(null, sellerEthereum, config)

	test("simple test v1", async () => {
		console.log(await buyerEthereum.getFrom())
		const tokenId = toBigNumber("1")
		await sentTxConfirm(it.testErc721.methods.mint(seller, tokenId, "url"), { from: seller })

		let order: SimpleOrder = {
			make: {
				assetType: {
					assetClass: "ERC721",
					contract: toAddress(it.testErc721.options.address!),
					tokenId: toBigNumber(tokenId),
				},
				value: toBigNumber("1"),
			},
			maker: seller,
			take: {
				assetType: {
					assetClass: "ETH",
				},
				value: toBigNumber("100000"),
			},
			salt: toWord("0x000000000000000000000000000000000000000000000000000000000000000a"),
			type: "RARIBLE_V1",
			data: {
				dataType: "LEGACY",
				fee: 3,
			},
		}

		await it.testErc721.methods
			.setApprovalForAll(config.transferProxies.nft, true)
			.send({ from: seller })

		const signedOrder: SimpleLegacyOrder = { ...order, signature: await sign(order) }
		await filler.buy({ order: signedOrder, amount: 1, originFee: 100 })

		const ownership = await retry(10, 4000, async () => {
			const ownership = await ownershipApi.getNftOwnershipById({
				ownershipId: `${it.testErc721.options.address}:${tokenId}:${buyer}`,
			})
			if (ownership.value.toString() !== "1") {
				throw new Error("Ownership value must be '1'")
			}
			return ownership
		})
		expect(ownership.value).toBe("1")
	})

	test("get transaction data", async () => {
		const tokenId = toBigNumber("1")

		let order: SimpleOrder = {
			make: {
				assetType: {
					assetClass: "ERC721",
					contract: toAddress(it.testErc721.options.address!),
					tokenId: toBigNumber(tokenId),
				},
				value: toBigNumber("1"),
			},
			maker: seller,
			take: {
				assetType: {
					assetClass: "ETH",
				},
				value: toBigNumber("100000"),
			},
			salt: toWord("0x000000000000000000000000000000000000000000000000000000000000000a"),
			type: "RARIBLE_V1",
			data: {
				dataType: "LEGACY",
				fee: 3,
			},
		}

		const signedOrder: SimpleLegacyOrder = { ...order, signature: await sign(order) }
		await filler.getTransactionData({ order: signedOrder, amount: 1, originFee: 100 })
	})
})
