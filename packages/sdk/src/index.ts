import type { BlockchainWallet } from "@rarible/sdk-wallet"
import {
	ActivityControllerApi,
	CollectionControllerApi,
	Configuration,
	ItemControllerApi,
	OrderControllerApi,
	OwnershipControllerApi,
} from "@rarible/api-client"
import type { IRaribleSdk } from "./domain"
import { getSDKBlockchainInstance } from "./sdk-blockchains"
import { CONFIGS } from "./config"

export function createRaribleSdk(wallet: BlockchainWallet, env: keyof typeof CONFIGS): IRaribleSdk {
	const config = CONFIGS[env]
	const configuration = new Configuration({ basePath: config.basePath })
	return {
		...getSDKBlockchainInstance(wallet, config),
		apis: {
			collection: new CollectionControllerApi(configuration),
			item: new ItemControllerApi(configuration),
			ownership: new OwnershipControllerApi(configuration),
			order: new OrderControllerApi(configuration),
			activity: new ActivityControllerApi(configuration),
		},
	}
}
