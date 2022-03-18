import React, { useCallback, useState } from "react"
import { IconButton, Tooltip } from "@mui/material"
import { Icon } from "./icon"
import { faCheck, faCopy, faTimes } from "@fortawesome/free-solid-svg-icons"

interface ICopyToClipboardProps {
	value: string
}

export function CopyToClipboard({ value }: ICopyToClipboardProps) {
	const [copied, setCopied] = useState<boolean | null>(null)
	const copyHandler = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(value)
			setCopied(true)
		} catch {
			setCopied(false)
		}
	}, [value])

	return <Tooltip title="Copy To Clipboard" placement="top">
		<IconButton
			color={copied === true ? "success" : (copied === false ? "warning" : "default")}
			onClick={copyHandler}
		>
			<Icon icon={copied === true ? faCheck : (copied === false ? faTimes : faCopy)}/>
		</IconButton>
	</Tooltip>
}