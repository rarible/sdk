import React, { useContext, useEffect, useState } from "react"
import type { IRaribleSdk } from "@rarible/sdk/build/domain"
import type { Items } from "@rarible/api-client"
import { Alert, AlertTitle, Box, CircularProgress } from "@mui/material"
import { Page } from "../../components/page"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { CommentedBlock } from "../../components/common/commented-block"
import { ItemsList } from "./items/items-list"
import { GetItemsComment } from "./comments/getitems-comment"

function useFetchItems(sdk?: IRaribleSdk, walletAddress?: string) {
	const [items, setItems] = useState<Items | null>(null)
	const [fetching, setFetching] = useState(false)
	const [error, setError] = useState<any>(null)

	async function fetchItems() {
		try {
			setFetching(true)
			const res = await sdk?.apis.item.getItemsByOwner({
				owner: walletAddress!,
			})

			setItems(res ?? null )
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
			setItems(null)
		} else {
			fetchItems().catch((e) => setError(e))
		}
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, [walletAddress])

	return { items, fetching, error }
}

export function ItemsPage() {
	const connection = useContext(ConnectorContext)
	const { items, fetching, error } = useFetchItems(connection.sdk, connection.walletAddress)

	return (
		<Page header="My Items">
			<CommentedBlock sx={{ my: 2 }} comment={<GetItemsComment/>}>
				{
					error && <CommentedBlock sx={{ my: 2 }}>
						<Alert severity="error">
							<AlertTitle>Items fetch error</AlertTitle>
							{error.message || error.toString()}
						</Alert>
					</CommentedBlock>
				}
				{
					fetching ? <Box sx={{
						my: 4,
						display: 'flex',
						justifyContent: "center",
					}}>
						<CircularProgress/>
					</Box> : ( items && <Box sx={{my: 2}}>
						<ItemsList items={items}/>
					</Box> )
				}
			</CommentedBlock>
		</Page>
	)
}
