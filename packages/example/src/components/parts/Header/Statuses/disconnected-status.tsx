import React from "react"
import { Button, Stack } from "@mui/material"
import { Link } from "react-router-dom"
import { faLink } from "@fortawesome/free-solid-svg-icons"
import { Icon } from "../../../common/icon"

export function DisconnectedStatus() {
	return (
		<Stack direction="row" alignItems="center" spacing={2}>
			<Button
				startIcon={<Icon icon={faLink}/>}
				color="inherit"
				variant="outlined"
				component={Link}
				to="/connect"
			>
				Connect
			</Button>
		</Stack>
	)
}