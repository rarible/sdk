import type { Maybe } from "@rarible/types/build/maybe"
import type { Provider } from "tezos-sdk-module/dist/common/base"
import type { ITezosAPI } from "./common"

export class TezosDeploy {
	constructor(
		private provider: Maybe<Provider>,
		private apis: ITezosAPI,
	) {
	}


}
