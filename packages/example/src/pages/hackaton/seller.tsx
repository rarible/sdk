import React, { useContext, useMemo, useState } from "react"
import { Box, Button, Grid, TextField } from "@mui/material"
import { WalletType } from "@rarible/sdk-wallet"
import {toBn} from "@rarible/utils"
import {toAddress} from "@rarible/types"
import { toBigNumber, toItemId } from "@rarible/types"
import { getEthereumItemId } from "@rarible/sdk/build/sdk-blockchains/ethereum/common"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import { Page } from "../../components/page"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"
import { TransactionInfo } from "../../components/common/transaction-info"
import { useRequestResult } from "../../components/hooks/use-request-result"
import { EnvironmentContext } from "../../components/connector/environment-selector-provider"
import { createEthSdk, getEthEnv, GetLotteryDataBlock } from "./common"

export function SellerPage() {
	return (
		<Page header="Seller interface">

			<SellBlock />
			<GetLotteryDataBlock isFinalizeEnabled={true} />
		</Page>
	)
}
export function SellBlock() {
	const connection = useContext(ConnectorContext)
	const { environment } = useContext(EnvironmentContext)
	const [itemId, setItemId] = useState("")
	const [price, setPrice] = useState("")
	const [tickets, setTickets] = useState("")
	const { result, startFetching, isFetching, setComplete, setError } = useRequestResult()

	const sdk = useMemo(() => {
		if (connection.sdk?.wallet?.walletType === WalletType.ETHEREUM) {
			return createEthSdk(connection.sdk?.wallet.ethereum, getEthEnv(environment))
		}
	}, [connection.sdk?.wallet])

	async function startLottery() {
		try {
			startFetching()
			if (sdk && connection.sdk?.wallet?.walletType === WalletType.ETHEREUM) {
				console.log("connection.sdk?.wallet.ethereum", connection.sdk?.wallet.ethereum)
				const bnPrice = toBn(price).multipliedBy(toBn(10).pow(18))
				const {contract, tokenId} = getEthereumItemId(toItemId(itemId))
				const {tx, lotteryId} = await sdk.hackaton.startLottery({
					makeAssetType: {
						contract: toAddress(contract),
						tokenId: toBigNumber(tokenId),
					},
					price: toBigNumber(bnPrice.toFixed()),
					tickets: toBigNumber(tickets),
				})
				console.log("tx", tx, "lotteryId", lotteryId)
				setComplete({tx: new BlockchainEthereumTransaction(tx, "testnet"), lotteryId: await lotteryId})
			}
		} catch (e) {
			setError(e)
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
							label="Item id"
							value={itemId}
							onChange={(e) => {
								setItemId(e.target.value)
							}}
						/>
						<TextField
							style={{marginRight: 20}}
							fullWidth={false}
							label="Price"
							value={price}
							onChange={(e) => {
								setPrice(e.target.value)
							}}
						/>
						<TextField
							fullWidth={false}
							label="Tickets"
							value={tickets}
							onChange={(e) => {
								setTickets(e.target.value)
							}}
						/>

					</Box>

					<Box sx={{ my: 2 }}>
						<Button
							variant="outlined"
							component="span"
							disabled={isFetching}
							onClick={() => startLottery()}
						>
							{isFetching ? "Selling..." : "Sell item" }
						</Button>
					</Box>

					<RequestResult
						result={result}
						completeRender={(data) =>
							<>
								<Box sx={{ my: 2 }}>
									<TransactionInfo transaction={data.tx}/>
								</Box>
								<Box sx={{ my: 2 }}>
                  lotteryId = {data.lotteryId}
								</Box>
							</>
						}
					/>
				</Grid>
			</Grid>
		</>
	)
}


export function FinalizeBlock() {
	const connection = useContext(ConnectorContext)
	const { environment } = useContext(EnvironmentContext)
	const [lotteryId, setLotteryId] = useState("")
	const { result, startFetching, isFetching, setComplete, setError } = useRequestResult()
	const sdk = useMemo(() => {
		if (connection.sdk?.wallet?.walletType === WalletType.ETHEREUM) {
			return createEthSdk(connection.sdk?.wallet.ethereum, getEthEnv(environment))
		}
	}, [connection.sdk?.wallet])

	async function finalizeLottery() {
		try {
			startFetching()
			if (sdk && connection.sdk?.wallet?.walletType === WalletType.ETHEREUM) {
				const tx = await sdk.hackaton.finaliseLottery({
					lotteryId: toBigNumber(lotteryId),
				})
				setComplete(new BlockchainEthereumTransaction(tx, getEthEnv(environment)))
			}
		} catch (e) {
			setError(e)
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
							color="success"
							disabled={isFetching}
							onClick={() => finalizeLottery()}
						>
							{isFetching ? "Finalizing..." : "Finalize lottery" }
						</Button>
					</Box>

					<RequestResult
						result={result}
						completeRender={(data) =>
							<>
								<Box sx={{ my: 2 }}>
									<TransactionInfo transaction={data.tx}/>
								</Box>
							</>
						}
					/>
				</Grid>
			</Grid>
		</>
	)
}
