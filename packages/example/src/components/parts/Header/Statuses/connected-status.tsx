import React, { useContext } from "react"
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material"
import { faLinkSlash } from "@fortawesome/free-solid-svg-icons"
import { Address } from "../../../common/address"
import { Icon } from "../../../common/icon"
import { EnvironmentContext } from "../../../connector/environment-selector-provider"
import { getEnvironmentName } from "../../../connector/environments"

export interface IConnectedStatusProps {
	disconnect?: () => Promise<void>
	address: string
}

export function ConnectedStatus({ disconnect, address }: IConnectedStatusProps) {
	const { environment } = useContext(EnvironmentContext)
	return (
		<Stack direction="row" alignItems="center" spacing={2}>
			<Tooltip title="SDK Connection Environment" placement="bottom">
				<Chip
					size="small"
					color="info"
					label={getEnvironmentName(environment)}
					sx={{
						lineHeight: 1.1,
						height: "20px",
						fontSize: "0.8125rem",
					}}
				/>
			</Tooltip>
			<Box sx={{ display: "inline" }}>
				<Typography variant="subtitle1" >Connected </Typography>
				<Typography variant="subtitle2">
					<Address address={address}/>
				</Typography>
			</Box>
			<IconButton
				color="inherit"
				title="Disconnect"
				onClick={disconnect}
			>
				<Icon icon={faLinkSlash}/>
			</IconButton>
		</Stack>
	)
}
