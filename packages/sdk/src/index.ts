// import { SellSdk } from "./order/sell"
// import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { BlockchainWallet } from "../../wallet/src"
import type { IRaribleSdk } from './domain'
import {getSDKBlockchainInstance} from "./sdk-blockchains";

export function createRaribleSdk(wallet: BlockchainWallet): IRaribleSdk {
    return getSDKBlockchainInstance(wallet)
}
