import type { Ethereum } from "@rarible/ethereum-provider"
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import React, { useContext, useMemo, useState } from "react"
import { WalletType } from "@rarible/sdk-wallet"
import { toBigNumber } from "@rarible/types"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import { Box, Button, Grid, TextField } from "@mui/material"
import type { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { EnvironmentContext } from "../../components/connector/environment-selector-provider"
import { useRequestResult } from "../../components/hooks/use-request-result"
import { RequestResult } from "../../components/common/request-result"
import { TransactionInfo } from "../../components/common/transaction-info"

export function createEthSdk(ethereum: Ethereum, env: EthereumNetwork) {
	return createRaribleSdk(ethereum, env)
}

export function getEthEnv(env: RaribleSdkEnvironment): EthereumNetwork {
	switch (env) {
		case "development": return "dev-ethereum"
		case "testnet": return "testnet"
		case "prod": return "mainnet"
		default: throw new Error("Env error")
	}
}
export function GetLotteryDataBlock(
	{isFinalizeEnabled, isBuyTicketsEnabled}: {isFinalizeEnabled?: boolean, isBuyTicketsEnabled?: boolean}
) {
	const connection = useContext(ConnectorContext)
	const { environment } = useContext(EnvironmentContext)
	const [lotteryId, setLotteryId] = useState("")
	const [ticketsAmount, setTicketsAmount] = useState("1")
	const {
		result: finalizeResult,
		startFetching: startFinalizeFetching,
		isFetching: isFinalizeFetching,
		setComplete: setFinalizeComplete,
		setError: setFinalizeError,
	} = useRequestResult()
	const {
		result: lotteryData,
		startFetching: startFetchingLottery,
		isFetching: isFetchingLottery,
		setComplete: setCompleteLotteryData,
		setError: setErrorLottery,
	} = useRequestResult()
	const {
		result: buyTicketsResult,
		startFetching: startFetchingBuyingTickets,
		isFetching: isFetchingBuyingTickets,
		setComplete: setCompleteBuyingTickets,
		setError: setErrorBuyingTickets,
	} = useRequestResult()

	const sdk = useMemo(() => {
		if (connection.sdk?.wallet?.walletType === WalletType.ETHEREUM) {
			return createEthSdk(connection.sdk?.wallet.ethereum, getEthEnv(environment))
		}
	}, [connection.sdk?.wallet])

	async function getLotteryData() {
		try {
			startFetchingLottery()
			if (sdk && connection.sdk?.wallet?.walletType === WalletType.ETHEREUM) {
				const data = await sdk.hackaton.getLotteryData(toBigNumber(lotteryId))
				console.log("data", data)
				setCompleteLotteryData(JSON.stringify(data, null, " "))
			}
		} catch (e) {
			setErrorLottery(e)
		}
	}

	async function finalizeLottery() {
		try {
			startFinalizeFetching()
			if (sdk && connection.sdk?.wallet?.walletType === WalletType.ETHEREUM) {
				const tx = await sdk.hackaton.finaliseLottery({
					lotteryId: toBigNumber(lotteryId),
				})
				setFinalizeComplete(new BlockchainEthereumTransaction(tx, getEthEnv(environment)))
			}
		} catch (e) {
			setFinalizeError(e)
		}
	}

	async function buyTickets() {
		try {
			startFetchingBuyingTickets()
			if (sdk && connection.sdk?.wallet?.walletType === WalletType.ETHEREUM) {
				const tx = await sdk.hackaton.buyTickets({
					lotteryId: toBigNumber(lotteryId),
					amount: toBigNumber(ticketsAmount),
				})
				console.log("tx", tx)
				setCompleteBuyingTickets(new BlockchainEthereumTransaction(tx, getEthEnv(environment)))
			}
		} catch (e) {
			setErrorBuyingTickets(e)
		}
	}

	return (
		<>
			<Grid container spacing={2}>
				<Grid item xs={6}>

					<Box sx={{ my: 2 }}>
						<TextField
							style={{marginRight: 20}}
							fullWidth={false}
							label="Lottery ID"
							value={lotteryId}
							onChange={(e) => {
								setLotteryId(e.target.value)
							}}
						/>
					</Box>


					<Box sx={{ my: 2 }}>
						<Button
							variant="outlined"
							component="span"
							disabled={isFetchingLottery}
							onClick={() => getLotteryData()}
						>
							{isFetchingLottery ? "Getting data..." : "Get lottery data" }
						</Button>
					</Box>

					<RequestResult
						result={lotteryData}
						completeRender={(data) =>
							<>
								<Box sx={{ my: 2 }}>
									<pre>
										{data}
									</pre>
								</Box>
							</>
						}
					/>

					{
						isBuyTicketsEnabled && (<>
							<Box sx={{ my: 2 }}>
								<TextField
									fullWidth={false}
									label="Tickets amount"
									value={ticketsAmount}
									onChange={(e) => {
										setTicketsAmount(e.target.value)
									}}
								/>
							</Box>

							<Box sx={{ my: 2 }}>
								<Button
									variant="outlined"
									component="span"
									disabled={isFetchingBuyingTickets}
									onClick={() => buyTickets()}
								>
									{isFetchingBuyingTickets ? "Buying tickets..." : "Buy tickets" }
								</Button>
							</Box>

							<RequestResult
								result={buyTicketsResult}
								completeRender={(data) =>
									<>
										<Box sx={{ my: 2 }}>
											<TransactionInfo transaction={data}/>
										</Box>
									</>
								}
							/>
						</>)
					}

					{
						isFinalizeEnabled && (
							<>
								<Box sx={{ my: 2 }}>
									<Button
										variant="outlined"
										component="span"
										color="success"
										disabled={isFinalizeFetching}
										onClick={() => finalizeLottery()}
									>
										{isFinalizeFetching ? "Finalizing..." : "Finalize lottery" }
									</Button>
								</Box>
								<RequestResult
									result={finalizeResult}
									completeRender={(data) =>
										<>
											<Box sx={{ my: 2 }}>
												<TransactionInfo transaction={data}/>
											</Box>
										</>
									}
								/>
							</>
						)
					}
				</Grid>
			</Grid>
		</>
	)
}
