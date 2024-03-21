import { AppBar, Container, Toolbar, Typography } from "@mui/material"
import { useSdkContext } from "../../connector/sdk"
import { ConnectedStatus } from "./Statuses/connected-status"
import { DisconnectedStatus } from "./Statuses/disconnected-status"
import { ConnectStatus } from "./Statuses/connection-status"

function ConnectionStatus() {
	const connection = useSdkContext()

	switch (connection.state.status) {
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
