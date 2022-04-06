import React from "react"
import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome"

export function Icon(props: FontAwesomeIconProps) {
	return <FontAwesomeIcon style={{fontSize: 14}} fixedWidth {...props} />
}