import React from "react"
import { Box, Typography } from "@mui/material"

interface IOrdersListProps {
	orders: string[]
}

export function BatchOrdersList({ orders }: IOrdersListProps) {
	if (!orders?.length) {
		return <Box sx={{ my: 2 }}>
			<Typography variant="h5" color="text.secondary" sx={{ textAlign: "center" }}>
				No Items found
			</Typography>
		</Box>
	}

	return (
		<Box sx={{
			my: 2,
			display: "flex",
			flexFlow: "column wrap",
			gap: 2,
		}}>
			{orders.map(order => <Box
				key={order}
				display="flex"
			>
				<Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
					Order ID: {order}
				</Typography>
			</Box>)}
		</Box>
	)
}
