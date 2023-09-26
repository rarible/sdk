import { Box, Button } from "@mui/material"
import React from "react"
import { useNavigate } from "react-router-dom"
import { Page } from "../../components/page"

export function HackatonPage() {
	const navigate = useNavigate()

	return (
		<Page header="Hackaton page">
			<Box sx={{ my: 2 }}>
				<Button
					variant="outlined"
					component="span"
					onClick={() => navigate("/hackaton/seller", {})}
				>
          Seller
				</Button>
			</Box>

			<Box sx={{ my: 2 }}>
				<Button
					variant="outlined"
					component="span"
					onClick={() => navigate("/hackaton/buyer", {})}
				>
          Buyer
				</Button>
			</Box>
		</Page>
	)
}
