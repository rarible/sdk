import type { SyntaxHighlighterProps } from "react-syntax-highlighter"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { darcula, materialLight } from "react-syntax-highlighter/dist/esm/styles/prism"

const SyntaxHighlighterFixed = SyntaxHighlighter as any as React.FC<SyntaxHighlighterProps>

interface ICodeProps {
  children: string
  theme?: "dark" | "light"
  language?: string
  wrap?: boolean
}
export function Code({ children, theme, language, wrap }: ICodeProps) {
  return (
    <SyntaxHighlighterFixed
      language={language ?? "typescript"}
      style={theme === "light" ? materialLight : darcula}
      wrapLongLines
      wrapLines={wrap}
      lineProps={wrap ? { style: { wordBreak: "break-all", whiteSpace: "pre-wrap" } } : undefined}
    >
      {children?.trim() ?? ""}
    </SyntaxHighlighterFixed>
  )
}
