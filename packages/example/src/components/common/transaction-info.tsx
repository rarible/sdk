import React, { useEffect, useState } from "react"
import { Code } from "./code"
import { IBlockchainTransaction } from "@rarible/sdk-transaction/build/domain"
import { Box, Chip, CircularProgress, Typography } from "@mui/material"
import { faCheckDouble, faTimes } from "@fortawesome/free-solid-svg-icons"
import { Icon } from "./icon"

interface ITransactionInfoProps {
	transaction: IBlockchainTransaction
}

function getTransactionInfo(transaction: IBlockchainTransaction) {
	let stringifyTransaction
	try {
		stringifyTransaction = JSON.stringify({
			blockchain: transaction.blockchain,
			hash: transaction.hash(),
			link: transaction.getTxLink(),
		}, null, " ")
	} catch (e: any) {
		console.log("Couldn't get transaction info from transaction object", e)
		if (typeof e.message === "string") {
			stringifyTransaction = e.message
		} else {
			stringifyTransaction = "Unknown error"
		}
	}

	return <Code theme={"light"} language="json" wrap>
		{stringifyTransaction}
	</Code>
}

function getTransactionResult(result: any) {
	if (!result) {
		return null
	}

	let stringifyResult
	try {
		stringifyResult = JSON.stringify(result, null, " ")
	} catch (e: any) {
		console.log("Couldn't get transaction result from transaction object", e)
		if (typeof e.message === "string") {
			stringifyResult = e.message
		} else {
			stringifyResult = "Unknown error"
		}
	}

	return <Code theme={"light"} language="json" wrap>
		{stringifyResult}
	</Code>
}



export function TransactionInfo({ transaction }: ITransactionInfoProps) {
	const [state, setState] = useState<"resolve" | "reject" | "pending">("pending")
	const [result, setResult] = useState(undefined)
	useEffect(() => {
		transaction.wait()
			.then((transaction) => {
				setState("resolve")
				setResult(transaction.result)

			})
			.catch(() => setState("reject"))
	}, [transaction])

	return <>
		<Typography variant="overline">Transaction:</Typography>
		<Box sx={{ my: 1 }}>
			<>
				{state === "pending" && <><CircularProgress size={14}/> Processing</>}
				{state === "resolve" && <Chip
          label="Confirmed"
          icon={<Icon icon={faCheckDouble}/>}
          variant="outlined"
          color="success"
          size="small"
        />}
				{state === "reject" && <Chip
          label="Rejected"
          icon={<Icon icon={faTimes}/>}
          variant="outlined"
          color="error"
          size="small"
        />}
			</>
		</Box>
		{ !transaction.isEmpty && getTransactionInfo(transaction) }
		{
			result && <>
				<Typography variant="overline">Transaction Result Data:</Typography>
				{getTransactionResult(result)}
			</>
		}
	</>
}
