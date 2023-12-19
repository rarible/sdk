import { toUnionAddress } from "@rarible/types"
import { createSdk } from "../common/test/create-sdk"
import type { RaribleSdkEnvironment } from "./domain"
import { configsDictionary } from "./index"

const envs = Object.keys(configsDictionary) as RaribleSdkEnvironment[]
describe.each(envs)("test all ", (env) => {
	const sdk = createSdk(undefined, env)

	test(`check eth balance with union api on ${env}`, async () => {
		const walletAddress = toUnionAddress("ETHEREUM:0xa14FC5C72222FAce8A1BcFb416aE2571fA1a7a91")
		await sdk.balances.getBalance(walletAddress, { "@type": "ETH" })
	})
})
