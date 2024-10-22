import { Box, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material"
import type { StateConnected } from "@rarible/connector/build/connection-state"
import { faLinkSlash } from "@fortawesome/free-solid-svg-icons"
import type { IWalletAndAddress } from "@rarible/connector-helper"
import { Address } from "../../../common/address"
import { Icon } from "../../../common/icon"
import { useEnvironmentContext } from "../../../connector/env"

export interface IConnectedStatusProps {
  state: StateConnected<IWalletAndAddress>
}

export function ConnectedStatus({ state }: IConnectedStatusProps) {
  const { envConfig } = useEnvironmentContext()
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Tooltip title="SDK Connection Environment" placement="bottom">
        <Chip
          size="small"
          color="info"
          label={envConfig.label}
          sx={{
            lineHeight: 1.1,
            height: "20px",
            fontSize: "0.8125rem",
          }}
        />
      </Tooltip>
      <Box sx={{ display: "inline" }}>
        <Typography variant="subtitle1">Connected </Typography>
        <Typography variant="subtitle2">
          <Address address={state.connection.address} />
        </Typography>
      </Box>
      <IconButton color="inherit" title="Disconnect" onClick={state.disconnect}>
        <Icon icon={faLinkSlash} />
      </IconButton>
    </Stack>
  )
}
