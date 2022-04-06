import React from "react"
import { Page } from "../../components/page"
import { Box, Typography } from "@mui/material"

export function NotFoundPage() {
  return (
      <Page>
          <Box my={5}>
              <Typography align="center" variant="h1" component="h1">
                  404
              </Typography>
              <Typography align="center" variant="h3" component="h1">
                  Page Not Found
              </Typography>
          </Box>
      </Page>
  );
}
