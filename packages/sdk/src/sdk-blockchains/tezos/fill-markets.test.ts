import { toItemId, toOrderId } from "@rarible/types"
import BigNumber from "bignumber.js"
// eslint-disable-next-line camelcase
import type { VersumSwapForm, HENSwapForm, TEIASwapForm, ObjktAskV1Form, ObjktAskV2Form, FXHashV1OfferForm, FXHashV2ListingForm } from "@rarible/tezos-sdk"
// eslint-disable-next-line camelcase
import { versum_swap, hen_swap, teia_swap, ask_v1, ask_v2, fxhash_v1_offer, fxhash_v2_listing } from "@rarible/tezos-sdk"
import type { RaribleSdkEnvironment } from "../../config/domain"
import { createSdk } from "../../common/test/create-sdk"
import { awaitForOwnership } from "./test/await-for-ownership"
import { createTestWallet } from "./test/test-wallet"
import { convertTezosItemId, convertTezosToUnionAddress, getMaybeTezosProvider } from "./common"
import { getOwnershipValue } from "./test/get-ownership"
import { TEST_PK_2, TEST_PK_3 } from "./test/credentials"

describe.skip("fill markets orders test", () => {
	const env: RaribleSdkEnvironment = "testnet"
	const wallet = createTestWallet(TEST_PK_2, env)
	const sellerWallet = createTestWallet(TEST_PK_3, env)
	const sellerProvider = getMaybeTezosProvider((sellerWallet as any).provider,  env, {
		basePath: `https://${env}-api.rarible.org`,
	} as any)
	const buyerSdk = createSdk(wallet, env)
	let buyerAddress: string

	beforeAll(async () => {
		buyerAddress = await wallet.provider.address()
		await returnNftsToSeller("KT1UH5RSbomuV1o6UuDB9yeACbqRMup3utGu:0")//TEZOS_VERSUM_V1
		await returnNftsToSeller("KT18pXXDDLMtXYxf6MpMGVKjmeSd6MuWnmjn:763001")//TEZOS_HEN
		await returnNftsToSeller("KT1P2VyFd61A3ukizJoX37nFF9fqZnihv7Lw:763001")//TEZOS_TEIA_V1
		await returnNftsToSeller("KT1TcrYJatTbrg9GoYDbsCu3phPGzMcTSaJn:0")    //TEZOS_OBJKT_V1 + TEZOS_OBJKT_V2
		await returnNftsToSeller("KT1VEXkw6rw6pJDP9APGsMneFafArijmM96j:1")    //TEZOS_FXHASH_V1
		await returnNftsToSeller("KT1WSwXCWPPAxAy4ibPmFyCm4NhmSJT9UuxQ:3")    //TEZOS_FXHASH_V2
		await returnNftsToSeller("KT1WSwXCWPPAxAy4ibPmFyCm4NhmSJT9UuxQ:1")    //TEZOS_FXHASH_V2
	})

	async function returnNftsToSeller(tezosItemId: string) {
		const itemId = convertTezosItemId(tezosItemId)
		try {
			const buyerOwnership = await buyerSdk.apis.ownership.getOwnershipById({
				ownershipId: `${itemId}:${buyerAddress}`,
			})
			if (!buyerOwnership || !buyerOwnership.value) {
				throw new Error("ownership has not been found")
			}
			const tx = await buyerSdk.nft.transfer({
				itemId: itemId,
				amount: parseInt(buyerOwnership.value),
				to: convertTezosToUnionAddress(await sellerWallet.provider.address()),
			})
			await tx.wait()
		} catch (e) {
			console.log("err", e)
			console.log(`returnNftsToSeller(${itemId}): none`)
		}
	}

	test("buy TEZOS_VERSUM_V1 order test", async () => {
		const itemId = toItemId("TEZOS:KT1UH5RSbomuV1o6UuDB9yeACbqRMup3utGu:0")
		const sellRequest: VersumSwapForm = {
			token_id: new BigNumber("0"),
			editions: new BigNumber("1"),
			price_per_item: new BigNumber(100),
		}

		const orderId = await versum_swap(sellerProvider as any, sellRequest)
		const startOwnershipValue = await getOwnershipValue(buyerSdk, itemId, buyerAddress)
		const fillAction = await buyerSdk.order.buy.prepare({
			orderId: toOrderId(orderId),
		})

		const tx = await fillAction.submit({
			amount: 1,
			infiniteApproval: true,
		})
		console.log("tx", tx)
		await tx.wait()

		const finishOwnership = await awaitForOwnership(buyerSdk, itemId, buyerAddress)
		expect(finishOwnership.value).toBe(new BigNumber(startOwnershipValue).plus("1").toString())
	}, 1500000)

	test("buy TEZOS_HEN order test", async () => {
		const itemId = toItemId("TEZOS:KT1P2VyFd61A3ukizJoX37nFF9fqZnihv7Lw:763001")
		const sellRequest: HENSwapForm = {
			token_id: new BigNumber("763001"),
			editions: new BigNumber("1"),
			price_per_item: new BigNumber(100),
		}

		const orderId = await hen_swap(sellerProvider as any, sellRequest)
		const startOwnershipValue = await getOwnershipValue(buyerSdk, itemId, buyerAddress)
		const tx = await buyerSdk.order.buy({
			orderId: toOrderId(orderId),
			amount: 1,
			infiniteApproval: true,
		})

		console.log("tx", tx)
		await tx.wait()

		const finishOwnership = await awaitForOwnership(buyerSdk, itemId, buyerAddress)
		expect(finishOwnership.value).toBe(new BigNumber(startOwnershipValue).plus("1").toString())
	}, 1500000)

	test("buy TEZOS_TEIA_V1 order test", async () => {
		const itemId = toItemId("TEZOS:KT1P2VyFd61A3ukizJoX37nFF9fqZnihv7Lw:763001")
		const sellRequest: TEIASwapForm = {
			token_id: new BigNumber("763001"),
			editions: new BigNumber("1"),
			price_per_item: new BigNumber("100"),
		}

		const orderId = await teia_swap(sellerProvider as any, sellRequest)
		const startOwnershipValue = await getOwnershipValue(buyerSdk, itemId, buyerAddress)
		const tx = await buyerSdk.order.buy({
			orderId: toOrderId(orderId),
			amount: 1,
			infiniteApproval: true,
		})

		console.log("tx", tx)
		await tx.wait()

		const finishOwnership = await awaitForOwnership(buyerSdk, itemId, buyerAddress)
		expect(finishOwnership.value).toBe(new BigNumber(startOwnershipValue).plus("1").toString())
	}, 1500000)

	test("buy TEZOS_OBJKT_V1 order test", async () => {
		const itemId = toItemId("TEZOS:KT1TcrYJatTbrg9GoYDbsCu3phPGzMcTSaJn:0")
		const sellRequest: ObjktAskV1Form = {
			token_contract: "KT1TcrYJatTbrg9GoYDbsCu3phPGzMcTSaJn",
			token_id: new BigNumber(0),
			amount: new BigNumber("0.1"),
			editions: new BigNumber(1),
			shares: [],
		}

		const orderId = await ask_v1(sellerProvider as any, sellRequest)
		const startOwnershipValue = await getOwnershipValue(buyerSdk, itemId, buyerAddress)
		const tx = await buyerSdk.order.buy({
			orderId: toOrderId(orderId),
			amount: 1,
			infiniteApproval: true,
		})

		console.log("tx", tx)
		await tx.wait()

		const finishOwnership = await awaitForOwnership(buyerSdk, itemId, buyerAddress)
		expect(finishOwnership.value).toBe(new BigNumber(startOwnershipValue).plus("1").toString())
	}, 1500000)

	test("buy TEZOS_OBJKT_V2 order test", async () => {
		const itemId = toItemId("TEZOS:KT1TcrYJatTbrg9GoYDbsCu3phPGzMcTSaJn:0")
		const sellRequest: ObjktAskV2Form = {
			token_contract: "KT1TcrYJatTbrg9GoYDbsCu3phPGzMcTSaJn",
			token_id: new BigNumber("0"),
			amount: new BigNumber("0.0002"),
			editions: new BigNumber("1"),
			shares: [],
			expiry_time: undefined,
		}

		const orderId = await ask_v2(sellerProvider as any, sellRequest)
		const startOwnershipValue = await getOwnershipValue(buyerSdk, itemId, buyerAddress)
		const tx = await buyerSdk.order.buy({
			orderId: toOrderId(orderId),
			amount: 1,
			infiniteApproval: true,
		})

		console.log("tx", tx)
		await tx.wait()

		const finishOwnership = await awaitForOwnership(buyerSdk, itemId, buyerAddress)
		expect(finishOwnership.value).toBe(new BigNumber(startOwnershipValue).plus("1").toString())
	}, 1500000)

	test("buy TEZOS_FXHASH_V1 order test", async () => {
		const itemId = toItemId("TEZOS:KT1VEXkw6rw6pJDP9APGsMneFafArijmM96j:1")
		const sellRequest: FXHashV1OfferForm = {
			token_id: new BigNumber("1"),
			price_per_item: new BigNumber("1"),
		}

		const orderId = await fxhash_v1_offer(sellerProvider as any, sellRequest)
		console.log("order", orderId)
		const startOwnershipValue = await getOwnershipValue(buyerSdk, itemId, buyerAddress)
		const tx = await buyerSdk.order.buy({
			orderId: toOrderId(orderId),
			amount: 1,
			infiniteApproval: true,
		})

		console.log("tx", tx)
		await tx.wait()

		const finishOwnership = await awaitForOwnership(buyerSdk, itemId, buyerAddress)
		expect(finishOwnership.value).toBe(new BigNumber(startOwnershipValue).plus("1").toString())
	}, 1500000)

	test("buy TEZOS_FXHASH_V2 order test", async () => {
		const itemId = toItemId("TEZOS:KT1WSwXCWPPAxAy4ibPmFyCm4NhmSJT9UuxQ:3")
		const sellRequest: FXHashV2ListingForm = {
			token_id: new BigNumber("3"),
			price_per_item: new BigNumber("1"),
			version: 1,
		}

		const orderId = await fxhash_v2_listing(sellerProvider as any, sellRequest)
		console.log("order", orderId)

		const startOwnershipValue = await getOwnershipValue(buyerSdk, itemId, buyerAddress)
		const tx = await buyerSdk.order.buy({
			orderId: toOrderId(orderId),
			amount: 1,
			infiniteApproval: true,
		})

		console.log("tx", tx)
		await tx.wait()

		const finishOwnership = await awaitForOwnership(buyerSdk, itemId, buyerAddress)
		expect(finishOwnership.value).toBe(new BigNumber(startOwnershipValue).plus("1").toString())
	}, 1500000)


})
