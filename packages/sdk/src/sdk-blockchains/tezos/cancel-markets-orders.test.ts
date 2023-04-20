import BigNumber from "bignumber.js"
import type { VersumSwapForm, TezosNetwork, HENSwapForm, TEIASwapForm, ObjktAskV1Form, ObjktAskV2Form, FXHashV1OfferForm, FXHashV2ListingForm } from "@rarible/tezos-sdk"
// eslint-disable-next-line camelcase
import { versum_swap, hen_swap, teia_swap, ask_v1, ask_v2, fxhash_v1_offer, fxhash_v2_listing } from "@rarible/tezos-sdk"
import { toOrderId } from "@rarible/types"
import type { RaribleSdkEnvironment } from "../../config/domain"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../common/logger/common"
import { createTestWallet } from "./test/test-wallet"
import { getMaybeTezosProvider } from "./common"
import { awaitCancelledOrder } from "./test/await-cancelled-order"

describe.skip("cancel markets orders", () => {
	const env: RaribleSdkEnvironment = "testnet"
	const tezosEnv: TezosNetwork = "testnet"

	const sellerWallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
		env
	)
	const sdk = createRaribleSdk(sellerWallet, env, { logs: LogsLevel.DISABLED })

	const sellerProvider = getMaybeTezosProvider((sellerWallet as any).provider, tezosEnv, {
		basePath: `https://${env}-api.rarible.org`,
	} as any)

	test("cancel TEZOS_VERSUM_V1 order", async () => {
		const sellRequest: VersumSwapForm = {
			token_id: new BigNumber("0"),
			editions: new BigNumber("1"),
			price_per_item: new BigNumber(100),
		}
		const orderId = toOrderId(await versum_swap(sellerProvider as any, sellRequest))

		console.log("orderId", orderId)
		const op = await sdk.order.cancel({ orderId })
		await op.wait()
		await awaitCancelledOrder(sdk, orderId)
	})

	test("cancel TEZOS_HEN order", async () => {
		const sellRequest: HENSwapForm = {
			token_id: new BigNumber("763001"),
			editions: new BigNumber("1"),
			price_per_item: new BigNumber(100),
		}

		const rawOrderId = await hen_swap(sellerProvider as any, sellRequest)

		const orderId = toOrderId(rawOrderId)

		console.log("orderId", orderId)
		const op = await sdk.order.cancel({ orderId })
		await op.wait()
		await awaitCancelledOrder(sdk, orderId)
	})

	test("cancel TEZOS_TEIA_V1 order", async () => {
		// const itemId = toItemId("TEZOS:KT1P2VyFd61A3ukizJoX37nFF9fqZnihv7Lw:763001")
		const sellRequest: TEIASwapForm = {
			token_id: new BigNumber("763001"),
			editions: new BigNumber("1"),
			price_per_item: new BigNumber("100"),
		}

		const rawOrderId = await teia_swap(sellerProvider as any, sellRequest)
		const orderId = toOrderId(rawOrderId)

		console.log("orderId", orderId)
		const op = await sdk.order.cancel({ orderId })
		await op.wait()
		await awaitCancelledOrder(sdk, orderId)
	})

	test("cancel TEZOS_OBJKT_V1 order", async () => {
		// const itemId = toItemId("TEZOS:KT1TcrYJatTbrg9GoYDbsCu3phPGzMcTSaJn:0")
		const sellRequest: ObjktAskV1Form = {
			token_contract: "KT1TcrYJatTbrg9GoYDbsCu3phPGzMcTSaJn",
			token_id: new BigNumber(0),
			amount: new BigNumber("0.1"),
			editions: new BigNumber(1),
			shares: [],
		}

		const rawOrderId = await ask_v1(sellerProvider as any, sellRequest)
		const orderId = toOrderId(rawOrderId)

		console.log("orderId", orderId)
		const op = await sdk.order.cancel({ orderId })
		await op.wait()
		await awaitCancelledOrder(sdk, orderId)
	})

	test("cancel TEZOS_OBJKT_V2 order", async () => {
		// const itemId = toItemId("TEZOS:KT1TcrYJatTbrg9GoYDbsCu3phPGzMcTSaJn:0")
		const sellRequest: ObjktAskV2Form = {
			token_contract: "KT1TcrYJatTbrg9GoYDbsCu3phPGzMcTSaJn",
			token_id: new BigNumber("0"),
			amount: new BigNumber("0.0002"),
			editions: new BigNumber("1"),
			shares: [],
			expiry_time: undefined,
		}

		const rawOrderId = await ask_v2(sellerProvider as any, sellRequest)
		const orderId = toOrderId(rawOrderId)

		console.log("orderId", orderId)
		const op = await sdk.order.cancel({ orderId })
		await op.wait()
		await awaitCancelledOrder(sdk, orderId)
	})

	test("cancel TEZOS_FXHASH_V1 order", async () => {
		// const itemId = toItemId("TEZOS:KT1VEXkw6rw6pJDP9APGsMneFafArijmM96j:1")
		const sellRequest: FXHashV1OfferForm = {
			token_id: new BigNumber("1"),
			price_per_item: new BigNumber("1"),
		}
		const rawOrderId = await fxhash_v1_offer(sellerProvider as any, sellRequest)
		const orderId = toOrderId(rawOrderId)

		console.log("orderId", orderId)
		const op = await sdk.order.cancel({ orderId })
		await op.wait()
		await awaitCancelledOrder(sdk, orderId)
	})

	test("cancel TEZOS_FXHASH_V2 order", async () => {
		// const itemId = toItemId("TEZOS:KT1WSwXCWPPAxAy4ibPmFyCm4NhmSJT9UuxQ:3")
		const sellRequest: FXHashV2ListingForm = {
			token_id: new BigNumber("3"),
			price_per_item: new BigNumber("1"),
			version: 1,
		}

		const rawOrderId = await fxhash_v2_listing(sellerProvider as any, sellRequest)
		const orderId = toOrderId(rawOrderId)

		console.log("orderId", orderId)
		const op = await sdk.order.cancel({ orderId })
		await op.wait()
		await awaitCancelledOrder(sdk, orderId)
	})
})
