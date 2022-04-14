import type { ContractAddress } from "@rarible/types"
import type { FlowMint } from "../mint"
import { testFlowCollection } from "./common"

const meta = "ipfs://ipfs/QmNe7Hd9xiqm1MXPtQQjVtksvWX6ieq9Wr6kgtqFo9D4CU"

export async function createTestItem(mint: FlowMint, collectionId: ContractAddress = testFlowCollection) {
	const prepareMint = await mint.prepare({
		collectionId: collectionId,
	})
	const { itemId } = await prepareMint.submit({
		uri: meta,
		supply: 1,
		lazyMint: false,
	})
	const flowItemId = itemId.split(":")[2]
	expect(parseInt(flowItemId)).toBeGreaterThan(0)
	return itemId
}
