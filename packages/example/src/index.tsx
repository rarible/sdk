import React from "react"
import ReactDOM from "react-dom"
import { App } from "./app"
import { BrowserRouter } from "react-router-dom"
import { CssBaseline, ThemeProvider } from "@mui/material"
import { appTheme } from "./theme"

ReactDOM.render(
  <React.StrictMode>
      <CssBaseline />
      <ThemeProvider theme={appTheme}>
          <BrowserRouter>
              <App />
          </BrowserRouter>
      </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);