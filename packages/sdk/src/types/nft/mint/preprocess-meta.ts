import type * as ApiClient from "@rarible/api-client"
import type { TezosMeta } from "../../../sdk-blockchains/tezos/common"

export type PreprocessMetaResponse = ApiClient.Meta | TezosMeta
export type PreprocessMetaRequest = ApiClient.Meta & { blockchain: ApiClient.Blockchain }

export type IPreprocessMeta = (meta: PreprocessMetaRequest) => PreprocessMetaResponse
