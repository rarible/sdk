import React from "react"

interface IInlineCodeProps {
	wrap?: boolean
}

export function InlineCode({ wrap, children }: React.PropsWithChildren<IInlineCodeProps>) {
	return <code style={{
		display: "inline-block",
		background: "#eee",
		borderRadius: 3,
		padding: "0 4px",
		color: "#df3d3d",
		wordBreak: wrap ? "break-word" : "normal",
		userSelect: "all"
	}}>{children}</code>
}