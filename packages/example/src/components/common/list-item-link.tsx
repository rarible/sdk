import React from "react"
import { ListItem, ListItemIcon, ListItemText } from "@mui/material"
import {
	Link as RouterLink,
	useLocation,
} from "react-router-dom"

interface IListItemLinkProps {
	to: string
	primary: React.ReactNode
	icon?: React.ReactNode
	default?: boolean
}

export function ListItemLink(props: IListItemLinkProps) {
	const { icon, primary, to } = props
	const location = useLocation();

	const renderLink = React.useMemo(
		() =>
			React.forwardRef(function Link(itemProps, ref) {
				return <RouterLink to={to} ref={ref as any} {...itemProps} role={undefined} />
			}),
		[to],
	)

	return (
		<li>
			<ListItem
				button
				component={renderLink}
				selected={
					location.pathname === to ||
					(props.default && (location.pathname === "" || location.pathname === "/"))
				}>
				{icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
				<ListItemText primary={primary} />
			</ListItem>
		</li>
	)
}