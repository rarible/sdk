import React, { useContext } from "react"
import type { Item } from "@rarible/api-client"
import { Box, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Typography } from "@mui/material"
import { MetaContent } from "@rarible/api-client/build/models/MetaContent"
import { Link } from "react-router-dom"
import { ConnectorContext } from "../../../components/connector/sdk-connection-provider"

function getMetaImageUrl(metaContent: MetaContent[] | undefined): string | null {
	for (let meta of metaContent || []) {
		if (meta["@type"] === "IMAGE") {
			return meta.url
		}
	}
	return null
}

interface IItemCardProps {
	item: Item
}

function ItemMedia({ url }: { url: string | null }) {
	if (!url) {
		return <Box
			display="flex"
			justifyContent="center"
			alignItems="center"
			sx={{ height: 194 }}
		>
			<Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
				<strong>No media provided</strong>
			</Typography>
		</Box>
	}

	return <CardMedia
		component="img"
		image={url}
		sx={{
			height: 194,
			objectFit: "contain",
		}}
	/>
}

export function ItemCard({ item }: IItemCardProps) {
	const connection = useContext(ConnectorContext)
	return (
		<Card sx={{ width: 200 }}>
			<CardHeader
				sx={{
					display: "flex",
					overflow: "hidden",
					"& .MuiCardHeader-content": {
						overflow: "hidden"
					}
				}}
				title={<Typography noWrap gutterBottom variant="h6" component="h4">
					{item.meta ? item.meta.name : "No metadata"}
				</Typography>}
			/>
			<ItemMedia url={getMetaImageUrl(item.meta?.content)}/>
			<CardContent>
				<Typography variant="body2" color="text.secondary" sx={{ textAlign: "right" }}>
					<strong>Supply: {item.supply}</strong>
				</Typography>
			</CardContent>
			<CardActions>
				<Button
					size="small"
					component={Link}
					to={`/sell/${item.id}`}
				>
					Sell
				</Button>
				<Button size="small" color={"warning"} onClick={ async () => {
					const b = await (connection?.sdk?.nft.burn({itemId: item.id}))
					const tx = await b?.submit()
					console.log(item.id, "done", "tx", tx?.getTxLink())
				}}>
					Burn
				</Button>
				{/*<Button size="small" color={"warning"}>Burn</Button>*/}
			</CardActions>
		</Card>
	)
}
