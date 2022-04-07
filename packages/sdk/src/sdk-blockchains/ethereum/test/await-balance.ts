import BigNumber from "bignumber.js"
import { Blockchain } from "@rarible/api-client"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { BigNumberValue } from "@rarible/utils"
import { convertEthereumToUnionAddress } from "../common"
import type { IRaribleSdk } from "../../../domain"
import { retry } from "../../../common/retry"
import type { RequestCurrencyAssetType } from "../../../common/domain"

export async function awaitBalance(
	sdk: IRaribleSdk, assetType: RequestCurrencyAssetType, wallet: EthereumWallet, value: BigNumberValue
) {
	return await retry(5, 2000, async () => {
		const address = convertEthereumToUnionAddress(await wallet.ethereum.getFrom(), Blockchain.ETHEREUM)
		const balance = new BigNumber(await sdk.balances.getBalance(address, assetType))
		expect(balance.toString()).toBe(value.toString())
		return balance
	})
}
