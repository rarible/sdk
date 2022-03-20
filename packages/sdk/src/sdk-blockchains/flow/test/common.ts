import { Blockchain } from "@rarible/api-client"
import { convertFlowContractAddress } from "../common/converters"
import { toCollectionId } from "../../../index"

export const testFlowCollection = toCollectionId("A.ebf4ae01d1284af8.RaribleNFT", Blockchain.FLOW)
export const testFlowToken = convertFlowContractAddress("A.7e60df042a9c0868.FlowToken")
