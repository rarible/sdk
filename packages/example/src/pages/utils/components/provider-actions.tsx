import { Box, Button, Grid, TextField, Typography } from "@mui/material"
import React, { useContext, useState } from "react"
import { WalletType } from "@rarible/sdk-wallet"
import { ConnectorContext } from "../../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../../components/common/request-result"
import { useRequestResult } from "../../../components/hooks/use-request-result"

export function ProviderActions() {
	const connection = useContext(ConnectorContext)
	const [chainId, setChainId] = useState("")
	const { result, setComplete } = useRequestResult()


	function switchToChain() {
		if (connection.sdk?.wallet?.walletType === WalletType.ETHEREUM) {
			connection.sdk?.wallet.ethereum.getCurrentProvider().request({
				method: "wallet_switchEthereumChain",
				params: [{ chainId: "0x" + parseInt(chainId).toString(16) }],
			})
		}
	}

	async function sendTransaction() {
		if (connection.sdk?.wallet?.walletType === WalletType.ETHEREUM) {

			const from = await connection.sdk?.wallet.ethereum.getFrom()

			connection.sdk?.wallet.ethereum.getCurrentProvider().request({
				method: "eth_sendTransaction",
				params: [
					{
						from,
						to: "0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb",
						value: "0x0",
						gasLimit: "0x5028",
						gasPrice: "0x2540be400",
						type: "0x0",
					},
				],
			})
		}
	}

	async function getFrom() {
		if (connection.sdk?.wallet?.walletType === WalletType.ETHEREUM) {
			const from = await connection.sdk?.wallet.ethereum.getFrom()
			setComplete(from)
		}
	}
	return (
		<div>
			<Typography sx={{ my: 2 }} variant="h4" component="h2" gutterBottom>
        Provider actions
			</Typography>

			<Grid container spacing={2}>

				<Grid container spacing={2}>

					<Grid item xs={6}>
						<Box sx={{ my: 2 }}>
							<TextField
								fullWidth={true}
								label="Switch to chain id"
								value={chainId}
								onChange={(e) => setChainId(e.target.value)}
							/>
						</Box>

						<Box sx={{ my: 2 }}>
							<Button
								variant="outlined"
								component="span"
								onClick={() => switchToChain()}
							>
              Switch to chain
							</Button>
						</Box>
					</Grid>
				</Grid>

				<Grid container spacing={2}>

					<Grid item xs={6}>
						<Box sx={{ my: 2 }}>
							<Button
								variant="outlined"
								component="span"
								onClick={() => sendTransaction()}
							>
              Send transaction
							</Button>
						</Box>

						<Box sx={{ my: 2 }}>
							<Button
								variant="outlined"
								component="span"
								onClick={() => getFrom()}
							>
              Get from
							</Button>
						</Box>
					</Grid>
				</Grid>

				<div style={{marginTop: 20, maxWidth: 500, wordBreak: "break-all"}}>
					<RequestResult
						result={result}
						completeRender={(data) =>
							<>
								<Box sx={{ my: 2 }}>
                  result: {data}
								</Box>
							</>
						}
					/>
				</div>
			</Grid>
		</div>
	)
}
