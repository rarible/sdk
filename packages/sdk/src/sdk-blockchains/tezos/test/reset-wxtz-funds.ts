import type { ContractAddress } from "@rarible/types"
import { toUnionAddress } from "@rarible/types"
import BigNumber from "bignumber.js"
import type { TezosWallet } from "@rarible/sdk-wallet"
import type { IRaribleSdk } from "../../../domain"

export async function resetWXTZFunds(wallet: TezosWallet, sdk: IRaribleSdk, contract: ContractAddress) {
	const bidderUnionAddress = toUnionAddress(`TEZOS:${await wallet.provider.address()}`)
	const wXTZInitBalance = new BigNumber(await sdk.balances.getBalance(
		bidderUnionAddress,
		{ "@type": "TEZOS_FT", contract }
	))

	// todo: unwrap not available anymore
	// if (wXTZInitBalance.gt("0")) {
	// 	const sdkConfig = getSdkConfig("testnet")
	// 	const provider = getMaybeTezosProvider(wallet.provider, "testnet", sdkConfig)
	// 	const tx = await unwrap(getRequiredProvider(provider), wXTZInitBalance)
	// 	await tx.confirmation()
	// }
}
