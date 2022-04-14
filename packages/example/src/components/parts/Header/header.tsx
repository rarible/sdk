import React, { useContext } from "react"
import { AppBar, Container, Toolbar, Typography } from "@mui/material"
import { ConnectorContext } from "../../connector/sdk-connection-provider"
import { ConnectedStatus } from "./Statuses/connected-status"
import { DisconnectedStatus } from "./Statuses/disconnected-status"
import { ConnectStatus } from "./Statuses/connection-status"

function ConnectionStatus() {
	const connection = useContext(ConnectorContext)

	switch (connection?.state.status) {
		case "connected":
			return <ConnectedStatus state={connection.state}/>
		case "disconnected":
			return <DisconnectedStatus/>
		case "connecting":
			return <ConnectStatus status={"Connecting..."}/>
		case "initializing":
		default:
			return null
	}
}

export function Header() {
	return (
		<AppBar position={"static"}>
			<Container maxWidth={"xl"} disableGutters>
			<Toolbar>
					<Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
						Rarible SDK Example
					</Typography>
					<ConnectionStatus/>
			</Toolbar>
			</Container>
		</AppBar>
	)
}
