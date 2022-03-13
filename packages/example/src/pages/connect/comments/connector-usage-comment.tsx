import React from "react"
import { Link, Typography } from "@mui/material"
import { Code } from "../../../components/common/code"
import { InlineCode } from "../../../components/common/inline-code"

export function ConnectorUsageComment() {
	return <>
		<Typography gutterBottom>
			To simplify connection to various wallets, we moved this logic to a separate
			package <InlineCode>@rarible/connector</InlineCode>.
		</Typography>
		<Code>
			{`
import { Connector, InjectedWeb3ConnectionProvider } from "@rarible/connector"
import { MEWConnectionProvider } from "@rarible/connector-mew"

// 1. Configure providers			
const injected = new InjectedWeb3ConnectionProvider()
const mew = new MEWConnectionProvider({
  networkId: 4,
  rpcUrl: ethereumRpcMap[4]
})
			
// 2. Create connector			
const connector = Connector
  .create(injected)
  .add(mew)
  
// 3. Connector ready to use
connector.connection.subscribe((con) => {  
  if (con.status === "connected") {
    // use connection to create sdk here
  }
})

// get list of available options
const options = await connector.getOptions()
// connect to first one
await connector.connect(options[0]) 
		`}
		</Code>
		<Typography gutterBottom>
			Check out more <Link href="https://github.com/rarible/sdk/tree/master/packages/connector"
			target="_blank">documentation in package repository</Link>.
		</Typography>
	</>
}
