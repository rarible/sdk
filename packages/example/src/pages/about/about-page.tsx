import React from "react"
import { Page } from "../../components/page"
import { InlineCode } from "../../components/common/inline-code"
import { Link } from "@mui/material"

export function AboutPage() {
  return (
      <Page header="About this example">
          With this example, you can:
          <ul>
              <li>Connect wallets</li>
              <li>Deploy collections</li>
              <li>Mint NFTs</li>
              <li>Sell NFTs</li>
              <li>Buy NFTs</li>
              <li>Make and accept Bid</li>
          </ul>
          This example uses:
          <ul>
              <li><InlineCode>@rarible/sdk</InlineCode> — <Link href="https://github.com/rarible/sdk" target="_blank">Rarible Protocol SDK</Link></li>
              <li><InlineCode>@rarible/connector</InlineCode> — <Link href="https://github.com/rarible/sdk/tree/master/packages/connector" target="_blank">Rarible SDK Wallet Connector</Link></li>
              <li><InlineCode>@rixio/react</InlineCode> — <Link href="https://github.com/roborox/rixio" target="_blank">Rixio</Link></li>
          </ul>
          See more information about SDK usage in <Link href="https://docs.rarible.org/" target="_blank">Protocol documentation</Link>.
      </Page>
  );
}
