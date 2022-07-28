import React, { useEffect, useState } from "react"
import { Code } from "./code"
import { IBlockchainTransaction } from "@rarible/sdk-transaction/build/domain"
import { Box, Chip, CircularProgress, Typography } from "@mui/material"
import { faCheckDouble, faTimes } from "@fortawesome/free-solid-svg-icons"
import { Icon } from "./icon"

interface ITransactionInfoProps {
	transaction: IBlockchainTransaction
}

export function TransactionPending({ transaction }: ITransactionInfoProps) {
	const [state, setState] = useState<"resolve" | "reject" | "pending">("pending")
	useEffect( () => {
		transaction.wait()
			.then(() => setState("resolve"))
			.catch(() => setState("reject"))
	}, [transaction])

	return <Box sx={{ my: 1 }}>
		<>
			{ state === "pending" && <><CircularProgress size={14}/> Processing</> }
			{ state === "resolve" && <Chip
				label="Confirmed"
				icon={<Icon icon={faCheckDouble}/>}
				variant="outlined"
				color="success"
				size="small"
			/> }
			{ state === "reject" && <Chip
				label="Rejected"
                icon={<Icon icon={faTimes}/>}
                variant="outlined"
                color="error"
				size="small"
			/> }
		</>
	</Box>
}

function getTransactionInfo(transaction: IBlockchainTransaction): string {
	try {
		return JSON.stringify({
			blockchain: transaction.blockchain,
			hash: transaction.hash(),
			link: transaction.getTxLink()
		}, null, " ")
	} catch (e: any) {
		console.log("Couldn't get transaction info from transaction object", e)
		if (typeof e.message === "string") {
			return e.message
		}
		return "Unknown error"
	}
}

export function TransactionInfo({ transaction }: ITransactionInfoProps) {
	if (transaction.isEmpty) {
		return null
	}

	return <>
		<Typography variant="overline">Transaction:</Typography>
		<TransactionPending transaction={transaction}/>
		<Code theme={"light"} language="json" wrap>
			{ getTransactionInfo(transaction) }
		</Code>
	</>
}
