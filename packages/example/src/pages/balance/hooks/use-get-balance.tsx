import { IRaribleSdk } from "@rarible/sdk"
import { UnionAddress } from "@rarible/types/build/union-address"
import { RequestCurrencyAssetType } from "@rarible/sdk/src/common/domain"
import { useEffect, useState } from "react"

export function useGetBalance(sdk: IRaribleSdk, walletAddress: UnionAddress, assetType: RequestCurrencyAssetType) {
	const [balance, setBalance] = useState<string | null>(null)
	const [fetching, setFetching] = useState(false)
	const [error, setError] = useState<any>(null)

	async function fetchItems() {
		try {
			setFetching(true)
			const res = await sdk?.balances.getBalance(walletAddress, assetType)

			setBalance(res.toString())
			setError(false)
		} catch (e: any) {
			if (e.json) {
				setError(await e.json())
			} else {
				setError(e)
			}
		} finally {
			setFetching(false)
		}
	}

	useEffect(() => {
		if (!walletAddress) {
			setBalance(null)
		} else {
			fetchItems().catch((e) => setError(e))
		}
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, [walletAddress])

	return { balance, fetching, error }
}