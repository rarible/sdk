import type { Maybe } from "@rarible/types/build/maybe"
import type { Provider } from "tezos-sdk-module/dist/common/base"
import { Action } from "@rarible/action"
import type { DeployTokenRequest } from "../../types/nft/deploy/domain"
import type { IDeploy } from "../../types/nft/deploy/domain"
import type { ITezosAPI } from "./common"

export class TezosDeploy {
	constructor(
		private provider: Maybe<Provider>,
		private apis: ITezosAPI,
	) {}

	deployToken: IDeploy = Action.create({
		id: "send-tx" as const,
		run: async (request: DeployTokenRequest) => {
			if (request.blockchain !== "TEZOS") {
				throw new Error("Wrong blockchain")
			}

			if (request.asset.assetType === "NFT") {

			} else if (request.asset.assetType === "MT") {

			} else {
				throw new Error("err")
			}

			return null as any
		},
	})
}
