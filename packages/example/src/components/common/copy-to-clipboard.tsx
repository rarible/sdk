import React, { useCallback, useState } from "react"
import { IconButton, Tooltip } from "@mui/material"
import { faCheck, faCopy, faTimes } from "@fortawesome/free-solid-svg-icons"
import { Icon } from "./icon"

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

  let iconButtonColor: "success" | "warning" | "default"
  if (copied === true) {
    iconButtonColor = "success"
  } else if (copied === false) {
    iconButtonColor = "warning"
  } else {
    iconButtonColor = "default"
  }

  let iconColor: any
  if (copied === true) {
    iconColor = faCheck
  } else if (copied === false) {
    iconColor = faTimes
  } else {
    iconColor = faCopy
  }

  return (
    <Tooltip title="Copy To Clipboard" placement="top">
      <IconButton color={iconButtonColor} onClick={copyHandler}>
        <Icon icon={iconColor} />
      </IconButton>
    </Tooltip>
  )
}
