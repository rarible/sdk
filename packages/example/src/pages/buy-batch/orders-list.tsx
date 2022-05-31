import React from "react"
import { Box, Typography } from "@mui/material"
import { PrepareFillBatchRequestWithAmount } from "@rarible/sdk/src/types/order/fill/domain"

interface IOrdersListProps {
	orders: (PrepareFillBatchRequestWithAmount & { orderId: string })[]
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
				key={order.orderId}
				display="flex"
			>
				<Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
					Order ID: {order.orderId}
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
					Amount: {order.amount}
				</Typography>
			</Box>)}
		</Box>
	)
}
