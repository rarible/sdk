import React from "react"
import { AppBar, Container, Toolbar, Typography } from "@mui/material"
import { useConnect } from "../../../connector/context"
import { ConnectedStatus } from "./Statuses/connected-status"
import { DisconnectedStatus } from "./Statuses/disconnected-status"
import { ConnectStatus } from "./Statuses/connection-status"

function ConnectionStatus() {
	const connect = useConnect()

	switch (connect.status) {
		case "connected":
			return <ConnectedStatus address={connect.address} disconnect={connect.disconnect}/>
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
