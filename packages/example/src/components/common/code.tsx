import React from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { darcula, materialLight } from "react-syntax-highlighter/dist/esm/styles/prism"

interface ICodeProps {
	children: string
	theme?: "dark" | "light"
	language?: string
	wrap?: boolean
}
export function Code({ children, theme, language, wrap }: ICodeProps) {
	return <SyntaxHighlighter
		language={language ?? "typescript"}
		style={theme === "light" ? materialLight : darcula}
		wrapLongLines
		wrapLines={wrap}
		lineProps={wrap ? {style: {wordBreak: 'break-all', whiteSpace: 'pre-wrap'}} : undefined}
	>
		{children?.trim() ?? ""}
	</SyntaxHighlighter>
}