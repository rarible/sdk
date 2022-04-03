import React, { useCallback, useContext, useMemo } from "react"
import { from } from "rxjs"
import { Rx } from "@rixio/react"
import { LoadingButton } from "@mui/lab"
import { Box, Button, MenuItem, Stack, TextField } from "@mui/material"
import { faChevronRight, faLinkSlash } from "@fortawesome/free-solid-svg-icons"
import { StateConnected } from "@rarible/connector/build/connection-state"
import { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { Icon } from "../../components/common/icon"
import { EnvironmentContext } from "../../components/connector/environment-selector-provider"
import { ENVIRONMENTS } from "../../components/connector/environments"

function getWalletInfo(option: string): { label: string } {
	switch (option) {
		case "walletlink":
			return { label: "Coinbase" }
		case "fcl":
			return { label: "Blocto" }
		default:
			return { label: option }
	}
}

export function ConnectOptions() {
	const { environment, setEnvironment } = useContext(EnvironmentContext)
	const connection = useContext(ConnectorContext)
	const { connector, state } = connection

	const options$ = useMemo(() => connector ? from(connector.getOptions()) : from([]), [connector])
	const envSelectHandler = useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
		setEnvironment?.(e.target.value as RaribleSdkEnvironment)
	}, [setEnvironment])

	if (!connector) {
		return null
	}

	const style = {
		justifyContent: "start",
		pl: "3rem",
		"& .MuiButton-startIcon": {
			position: "absolute",
			left: "1.25rem"
		}
	}

	return <Box sx={{
		maxWidth: 300
	}}>
		<Rx value$={options$}>
			{options => (
				<Stack spacing={1}>
					<TextField
						select
						size="small"
						label="Environment"
						disabled={state?.status === "connected"}
						value={environment}
						onChange={envSelectHandler}
					>
						{ENVIRONMENTS.map((option) => (
							<MenuItem key={option.value} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</TextField>
					{
						options.map(o => {
							const walletInfo = getWalletInfo(o.option)
							return <LoadingButton
								key={o.option}
								onClick={() => connector.connect(o)}
								loading={state.status === "connecting" && state.providerId === o.provider.getId()}
								loadingPosition="start"
								startIcon={<Icon icon={faChevronRight}/>}
								sx={style}
								variant="outlined"
								disabled={state?.status === "connected"}
								fullWidth
							>
								{walletInfo.label}
							</LoadingButton>
						})
					}
					<Button
						onClick={(state as StateConnected<any>).disconnect}
						startIcon={<Icon icon={faLinkSlash}/>}
						color="error"
						sx={style}
						variant="outlined"
						disabled={state?.status !== "connected"}
						fullWidth
					>
						Disconnect
					</Button>
				</Stack>
			)}
		</Rx>
	</Box>
}
