import type { ReactNode } from "react"
import { useMemo, forwardRef } from "react"
import { ListItem, ListItemIcon, ListItemText } from "@mui/material"
import { Link as RouterLink, useLocation } from "react-router-dom"

interface IListItemLinkProps {
  to: string
  primary: ReactNode
  icon?: ReactNode
  isDefault?: boolean
}

export function ListItemLink({ icon, primary, to, isDefault }: IListItemLinkProps) {
  const { pathname } = useLocation()
  const selected = pathname === to || (isDefault && (pathname === "" || pathname === "/"))

  const component = useMemo(
    () => forwardRef<HTMLAnchorElement>((itemProps, ref) => <RouterLink to={to} ref={ref} {...itemProps} />),
    [to],
  )

  return (
    <li>
      <ListItem component={component} button selected={selected}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  )
}
