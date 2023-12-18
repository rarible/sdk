import React, { useCallback, useContext } from "react"
import { LoadingButton } from "@mui/lab"
import { Box, Button, MenuItem, Stack, TextField } from "@mui/material"
import type { ConnectionProvider } from "@rarible/connector"
import { MappedConnectionProvider } from "@rarible/connector"
import type { MattelConnectionProvider } from "@rarible/connector-mattel"
import { faChevronRight, faLinkSlash } from "@fortawesome/free-solid-svg-icons"
import type { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"
import { Icon } from "../../components/common/icon"
import { EnvironmentContext } from "../../components/connector/environment-selector-provider"
import { ENVIRONMENTS } from "../../components/connector/environments"
import { useConnect } from "../../connector/context"

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
	const connect = useConnect()
	const { connector, status } = connect

	const options = connector.getOptions()
	const envSelectHandler = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			setEnvironment?.(e.target.value as RaribleSdkEnvironment)
		},
		[setEnvironment]
	)

	if (!connector) {
		return null
	}

	const style = {
		justifyContent: "start",
		pl: "3rem",
		"& .MuiButton-startIcon": {
			position: "absolute",
			left: "1.25rem",
		},
	}

	return (
		<Box
			sx={{
				maxWidth: 300,
			}}
		>
			<Stack spacing={1}>
				<TextField
					select
					size="small"
					label="Environment"
					disabled={status === "connected"}
					value={environment}
					onChange={envSelectHandler}
				>
					{ENVIRONMENTS.map((option) => (
						<MenuItem key={option.value} value={option.value}>
							{option.label}
						</MenuItem>
					))}
				</TextField>
				{options.map((o) => {
					const walletInfo = getWalletInfo(o.option)
					return (
						<LoadingButton
							key={o.option}
							onClick={() => {
								if (o.provider.getId() === "mattel" && status !== "connected") {
									if (isMappedProvider(o.provider)) {
										const provider = o.provider.getProvider() as MattelConnectionProvider
										provider.setPopupConfig({
											popup: openPopup(""),
										})
									}
								}
								connector.connect(o)
							}}
							loading={
								connect.status === "connecting" &&
								connect.option === o.provider.getId()
							}
							loadingPosition="start"
							startIcon={<Icon icon={faChevronRight} />}
							sx={style}
							variant="outlined"
							disabled={status === "connected"}
							fullWidth
						>
							{walletInfo.label}
						</LoadingButton>
					)
				})}
				<Button
					onClick={(connect.status === "connected" ? connect.disconnect : undefined)}
					startIcon={<Icon icon={faLinkSlash} />}
					color="error"
					sx={style}
					variant="outlined"
					disabled={status !== "connected"}
					fullWidth
				>
					Disconnect
				</Button>
			</Stack>
		</Box>
	)
}

function isMappedProvider<O, C>(x: ConnectionProvider<O, C>): x is MappedConnectionProvider<O, C, any> {
	return (x && x instanceof MappedConnectionProvider) || ("source" in x && "mapper" in x)
}

function openPopup(url: string) {
	const width = 400
	const height = 600
	const left = window.screenX + (window.innerWidth - width) / 2
	const top = window.screenY + (window.innerHeight - height) / 2

	return window.open(
		url,
		"auth0:authorize:popup",
		`left=${left},top=${top},width=${width},height=${height},resizable,scrollbars=yes,status=1`
	)
}
