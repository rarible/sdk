import React from "react"
import { cutString } from "../../utils/cut-string"

interface IAddressProps {
	address?: string
	trim?: boolean
}

export function Address({ address, trim = true }: IAddressProps) {
	return <span title={address}>
		 { trim ? cutString(address, 16) : address}
	</span>
}