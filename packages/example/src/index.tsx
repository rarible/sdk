import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter } from "react-router-dom"
import { CssBaseline, ThemeProvider } from "@mui/material"
import { App } from "./app"
import { appTheme } from "./theme"

function Root() {
	return (
		<React.StrictMode>
			<CssBaseline />
			<ThemeProvider theme={appTheme}>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</ThemeProvider>
		</React.StrictMode>
	)
}

ReactDOM.render(<Root />, document.getElementById("root"))
