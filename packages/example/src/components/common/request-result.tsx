import React from "react"
import { Alert, AlertTitle, Box } from "@mui/material"
import { IRequestResult } from "../hooks/use-request-result"
import { Icon } from "./icon"
import { faCheck, faExclamationCircle } from "@fortawesome/free-solid-svg-icons"

interface IRequestResultProps<T> {
	result: IRequestResult<any>["result"]
	completeRender?: (data: T) => React.ReactNode
}

export function RequestResult({ result, completeRender }: IRequestResultProps<any>) {
	switch (result.type) {
		case "empty":
			return null
		case "error":
			return <Alert severity="error" icon={<Icon icon={faExclamationCircle}/>}>
				<AlertTitle>Request rejected</AlertTitle>
				{result.error}
			</Alert>
		case "complete":
			return <Box>
				<Alert variant="outlined" severity="success" icon={<Icon icon={faCheck}/>}>
					<AlertTitle>Request completed</AlertTitle>
					{completeRender?.(result.data)}
				</Alert>
			</Box>
	}
}