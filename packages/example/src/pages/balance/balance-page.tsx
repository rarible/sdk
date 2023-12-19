import React from "react"
import type { WalletType } from "@rarible/sdk-wallet"
import { Box } from "@mui/material"
import { Page } from "../../components/page"
import { useSdk } from "../../components/connector/sdk-connection-provider"
import { CommentedBlock } from "../../components/common/commented-block"
import { UnsupportedBlockchainWarning } from "../../components/common/unsupported-blockchain-warning"
import { GetBalanceComment } from "./comments/getbalance-comment"
import { NativeBalance } from "./native-balance"
import { useConnect } from "../../connector/context"

function validateConditions(blockchain: WalletType | undefined): boolean {
	return !!blockchain
}

export function BalancePage() {
	const sdk = useSdk()
	const blockchain = sdk?.wallet?.walletType
	const connect = useConnect()
	const walletAddress = connect.status === "connected" ? connect.address : undefined

	return (
		<Page header="Balances">
			{
				!validateConditions(blockchain) && (
					<CommentedBlock sx={{ my: 2 }}>
						<UnsupportedBlockchainWarning blockchain={blockchain}/>
					</CommentedBlock>
				)
			}
			<CommentedBlock sx={{ my: 2 }} comment={<GetBalanceComment/>}>
				<Box sx={{ my: 2 }}>
					{
						sdk && sdk.wallet && walletAddress ?
							<NativeBalance
								sdk={sdk}
								walletAddress={walletAddress }
								wallet={sdk.wallet}
							/> : null
					}
				</Box>
			</CommentedBlock>
		</Page>
	)
}
