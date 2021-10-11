import {BlockchainWallet} from "@rarible/sdk-wallet/src";
import {createEthereumSdk} from "./ethereum";
import {Blockchain} from "@rarible/api-client";
import {IRaribleSdk} from "../domain";
import {createFlowSdk} from "./flow";

export function getSDKBlockchainInstance(wallet: BlockchainWallet): IRaribleSdk {
	if (wallet.blockchain === "ETHEREUM") {
		return createEthereumSdk(wallet)
	} else if (wallet.blockchain === "FLOW") {
		return createFlowSdk(wallet)
	} else {
		throw new Error("Unsupported wallet blockchain")
	}
}
