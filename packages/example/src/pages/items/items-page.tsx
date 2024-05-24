import { useCallback, useEffect, useState } from "react"
import type { IRaribleSdk } from "@rarible/sdk/build/domain"
import type { Blockchain, Items } from "@rarible/api-client"
import { Alert, AlertTitle, Box, CircularProgress } from "@mui/material"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { useSdkContext } from "../../components/connector/sdk"
import { ItemsList } from "./items/items-list"
import { GetItemsComment } from "./comments/getitems-comment"

function useFetchItems(sdk?: IRaribleSdk, walletAddress?: string, blockchain?: string) {
  const [items, setItems] = useState<Items | null>(null)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<any>(null)

  const fetchItems = useCallback(async () => {
    try {
      if (!blockchain) throw new Error("useFetchItems: blockchain should be specified")
      setFetching(true)
      const res = await sdk?.apis.item.getItemsByOwner({
        owner: walletAddress!,
        blockchains: blockchain ? [blockchain as Blockchain] : [],
      })

      setItems(res ?? null)
      setError(false)
    } catch (e) {
      if (e.json) {
        setError(await e.json())
      } else {
        setError(e)
      }
    } finally {
      setFetching(false)
    }
  }, [sdk, blockchain, walletAddress])

  useEffect(() => {
    if (!walletAddress) {
      setItems(null)
    } else {
      fetchItems().catch(e => setError(e))
    }
  }, [walletAddress, fetchItems])

  return { items, fetching, error }
}

export function ItemsPage() {
  const connection = useSdkContext()

  if (connection.state.status !== "connected") {
    return null
  }

  // @todo fix it
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { items, fetching, error } = useFetchItems(
    connection.sdk,
    connection.walletAddress,
    connection.state.connection.blockchain,
  )

  return (
    <Page header="My Items">
      <CommentedBlock sx={{ my: 2 }} comment={<GetItemsComment />}>
        {error && (
          <CommentedBlock sx={{ my: 2 }}>
            <Alert severity="error">
              <AlertTitle>Items fetch error</AlertTitle>
              {error.message || error.toString()}
            </Alert>
          </CommentedBlock>
        )}
        {fetching ? (
          <Box
            sx={{
              my: 4,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          items && (
            <Box sx={{ my: 2 }}>
              <ItemsList items={items} />
            </Box>
          )
        )}
      </CommentedBlock>
    </Page>
  )
}
