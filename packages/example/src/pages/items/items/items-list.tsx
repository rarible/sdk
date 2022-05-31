import React from "react"
import type { Items } from "@rarible/api-client"
import { ItemCard } from "./item-card"
import { Box, Typography } from "@mui/material"

interface IItemsListProps {
	items: Items
}

export function ItemsList({ items }: IItemsListProps) {
	if (!items?.items?.length) {
		return <Box sx={{my: 2}}>
			<Typography variant="h5" color="text.secondary" sx={{ textAlign: "center" }}>
				No Items found
			</Typography>
		</Box>
	}

	return (
		<Box sx={{
			my: 2,
			display: "flex",
			gap: 2,
			flexWrap: "wrap",
		}}>
			{items?.items.map((item) => <ItemCard key={item.id} item={item}/>)}
		</Box>
	)
}
