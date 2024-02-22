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
			connection.sdk?.wallet.ethereum.getCurrentProvider().send({
				method: "wallet_switchEthereumChain",
				params: [{ chainId: "0x" + parseInt(chainId).toString(16) }],
			})
		}
	}

	async function getChainId() {
		if (connection.sdk?.wallet?.walletType === WalletType.ETHEREUM) {
			const chainId = await connection.sdk?.wallet.ethereum.getChainId()
			setComplete(chainId)
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
						// to: "0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb",
						// value: "0x0",
						// gasLimit: "0x5028",
						// gasPrice: "0x2540be400",
						// type: "0x0",
						// chainId: "0x1"
						to: "0x0e7B24d73e45B639A5cF674C5f2Bb02930716f87",
						value: "0x24dce54d34a1a0000",
						data: "0x0d5f7d3500000000000000000000000000000000000000000000000000000000000000200000000000000000000000001edaef7b9440a6184637a4772943d267f6f1e962000000000000000000000000000000000000000000000000000000000000000173ad21460000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000024dce54d34a1a00000000000000000000000000000000000000000000000000000000000000000000f61814aa6b2f8e83076c9902ab01465ef23a267bd817b5cba3b9a77776987a9d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000663b6cc223d235ef00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000003600000000000000000000000000000000000000000000000024dce54d34a1a0000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000003e000000000000000000000000000000000000000000000000000000000000000400000000000000000000000007cf4ac414c94e03ecb2a7d6ea8f79087453caef00000000000000000000000000000000000000000000000000000000000003e8600000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000f22f838aaca272afb0f268e4f4e655fac3a35ec000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000417576b36aeea84f97d01ca4dc09a3385d139746ec62110e5f2448983bba4071fa6954e5fab82bbede8b7076c219bc597b02894711c7619f8bd313fc3eab7a39fb1b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
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

					<Box sx={{ my: 2 }}>
						<Button
							variant="outlined"
							component="span"
							onClick={() => getChainId()}
						>
              Get chain id
						</Button>
					</Box>
				</Grid>

				<div style={{marginTop: 30, marginLeft: 20, maxWidth: 500, wordBreak: "break-all"}}>
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
