import { toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../index"
import type { RaribleSdkEnvironment } from "./domain"
import { configsDictionary } from "./index"

const envs = Object.keys(configsDictionary) as RaribleSdkEnvironment[]
describe.each(envs)("test all ", (env) => {
	const sdk = createRaribleSdk(undefined, env, {
		apiKey: getAPIKey(env),
	})

	test(`check eth balance with union api on ${env}`, async () => {
		const walletAddress = toUnionAddress("ETHEREUM:0xa14FC5C72222FAce8A1BcFb416aE2571fA1a7a91")
		await sdk.balances.getBalance(walletAddress, { "@type": "ETH" })
	})
})

console.log("process.env keys", process.env.SDK_API_KEY_PROD, process.env.SDK_API_KEY_TESTNET)
export function getAPIKey(env:  RaribleSdkEnvironment) {
	switch (env) {
		case "prod":
			return process.env.SDK_API_KEY_PROD
		default:
			return process.env.SDK_API_KEY_TESTNET
	}
}
