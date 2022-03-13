import React from "react"
import { Box, Stack, Typography } from "@mui/material"

export function ConnectStatus({ status }: { status: string }) {
	return (
		<Stack direction="row" alignItems="center" spacing={2}>
			<Box sx={{ display: "inline" }}>
				<Typography variant="subtitle1">{ status }</Typography>
			</Box>
		</Stack>
	)
}