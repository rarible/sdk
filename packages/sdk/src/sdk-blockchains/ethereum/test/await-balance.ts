import BigNumber from "bignumber.js"
import type { AssetType } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { BigNumberValue } from "@rarible/utils"
import type { EVMBlockchain } from "../common"
import { convertEthereumToUnionAddress } from "../common"
import type { IRaribleSdk } from "../../../domain"
import { retry } from "../../../common/retry"

export async function awaitBalance(
	sdk: IRaribleSdk, assetType: AssetType, wallet: EthereumWallet<EVMBlockchain>, value: BigNumberValue
) {
	return await retry(5, 2000, async () => {
		const address = convertEthereumToUnionAddress(await wallet.ethereum.getFrom(), Blockchain.ETHEREUM)
		const balance = new BigNumber(await sdk.balances.getBalance(address, assetType))
		expect(balance.toString()).toBe(value.toString())
		return balance
	})
}
