import { toUnionAddress } from "@rarible/types"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { createRaribleSdk } from "../index"
import type { RaribleSdkEnvironment } from "./domain"
import { configsDictionary } from "./index"

const envs = Object.keys(configsDictionary) as RaribleSdkEnvironment[]

describe.each(envs)("test all ", (env) => {
	const it = awaitAll({
		sdk: createRaribleSdk(undefined, env),
	})

	test("check eth balance with union api", async () => {
		const walletAddress = toUnionAddress("ETHEREUM:0xa14FC5C72222FAce8A1BcFb416aE2571fA1a7a91")
		await it.sdk.balances.getBalance(walletAddress, { "@type": "ETH" })
	})
})
