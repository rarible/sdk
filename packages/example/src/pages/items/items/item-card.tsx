import React from "react"
import type { Item } from "@rarible/api-client"
import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	CardMedia,
	IconButton,
	Typography,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import SendIcon from "@mui/icons-material/Send"
import { MetaContent } from "@rarible/api-client/build/models/MetaContent"
import { Link } from "react-router-dom"

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
				<IconButton
					size="small"
					component={Link}
					to={`/transfer/${item.id}`}
					title="Transfer"
				>
					 <SendIcon />
				</IconButton>
				<IconButton
					size="small"
					color={"warning"}
					component={Link}
					to={`/burn/${item.id}`}
					title="Burn"
				>
					<DeleteIcon />
				</IconButton>
			</CardActions>
		</Card>
	)
}
