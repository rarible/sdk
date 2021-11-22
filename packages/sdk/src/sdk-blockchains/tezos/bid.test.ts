// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import BigNumber from "bignumber.js"
import { toItemId } from "@rarible/types"
import { TezosWallet } from "@rarible/sdk-wallet"
import { createRaribleSdk } from "../../index"

describe("bid test", () => {
	const tezos = in_memory_provider(
		"edskRzKnQB3jFrx8qYRedDguFNnrmePpvmAyBt6zTz1RzDm3vVnqtrqhhuM8SupK2gTYgq2jdMGJUgvMXJiG5Vz7Wd6Ub2hFTR",
		// "edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8",
		"https://granada.tz.functori.com"
	)

	const wallet = new TezosWallet(tezos)
	const sdk = createRaribleSdk(wallet, "e2e")

	let fa2Contract: string = "KT18ewjrhWB9ZZFYZkBACHxVEPuTtCg2eXPF"

	beforeAll(async () => {
		/*
		const op = await deploy_fa2(
			provider,
			sender,
			royaltiesContract
		)
		console.log("op", op)
		if (op.contract) {
			fa2Contract = op.contract
			console.log("fa2Contract", fa2Contract)
		}

		const conf = await op.confirmation()


     */
	}, 1500000)


	/*
	test("as", async () => {
		const item = await itemController.getItemById({
			itemId: `TEZOS:${fa2Contract}:102`,
		})
		console.log("item", item)
	})

   */

	test("bid test", async () => {
		const sender = await tezos.address
		/*
    const tx = await mint(
      provider,
      fa2Contract,
      {},
      new BigNumber(100),
      new BigNumber(101),
      {},
    )
    if (tx.token_id) {
      console.log("mint token id=", tx.token_id.toString())
      // const item = await sdk.apis.item.getItemById({
      // 	itemId: toItemId(`TEZOS:${fa2Contract}:${tx.token_id.toString()}`),
      // })
      // console.log("item", item)
    }


    // await sdk.order.bid({ itemId: `TEZOS:${fa2Contract}:101` as any })

     */
		const item = await sdk.apis.item.getItemById({
    	itemId: toItemId("TEZOS:KT1Hfuf2zwM2kjyYt1nCLPnfFdrofdNp8Xyh:1"),
		})
		console.log("item", item)

	}, 1500000)

})
