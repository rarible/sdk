import { CollectionControllerApi, Configuration, ItemControllerApi, OrderControllerApi } from "@rarible/api-client"
import { FlowNetwork } from "@rarible/sdk-wallet/src"

type Api = {
	itemController: ItemControllerApi
	collectionController: CollectionControllerApi
	orderController: OrderControllerApi
}

export enum ApiNetwork {
	TESTNET = "https://api-dev.rarible.org",
	MAINNET = "https://api.rarible.org" //not sure
}

export function api(network: FlowNetwork): Api {
	const basePath = network === "testnet" ? ApiNetwork.TESTNET : ApiNetwork.MAINNET
	const conf = new Configuration({ basePath })
	return {
		itemController: new ItemControllerApi(conf),
		collectionController: new CollectionControllerApi(conf),
		orderController: new OrderControllerApi(conf),
	}
}
