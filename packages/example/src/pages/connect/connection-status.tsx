import React, { useContext } from "react"
import { isString } from "lodash"
import { Alert, AlertTitle, Box } from "@mui/material"
import { faLink, faLinkSlash } from "@fortawesome/free-solid-svg-icons"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { Icon } from "../../components/common/icon"
import { Address } from "../../components/common/address"

function connectionErrorMessage(error: any): string | null {
	if (!error) {
		return null
	}

	if (error.message) {
		return error.message
	} else if (isString(error)) {
		return error.replace(/^error:\s/gi, "")
	}

	return null
}

export function ConnectionStatus() {
	const connection = useContext(ConnectorContext)

	switch (connection?.state.status) {
		case "connected":
			return <Alert severity="success" icon={<Icon icon={faLink}/>}>
				<AlertTitle>Current Status: connected</AlertTitle>
				Application is connected to wallet <Address
				address={connection.state.connection.address}
				trim={false}
			/>
			</Alert>
		case "disconnected":
			const error = connectionErrorMessage(connection?.state.error)
			return <Alert severity="error" icon={<Icon icon={faLinkSlash}/>}>
				<AlertTitle>Disconnected</AlertTitle>
				Application currently not connected to any wallet
				{ error && <Box sx={{ mt: 1 }}>Last attempt error: {error}</Box> }
			</Alert>
		case "connecting":
			return <Alert severity="info">
				<AlertTitle>Connecting...</AlertTitle>
				Connection to wallet in process
			</Alert>
		case "initializing":
			return <Alert severity="info">
				<AlertTitle>Initializing...</AlertTitle>
				Connector initialization
			</Alert>
		default:
			return null
	}
}
