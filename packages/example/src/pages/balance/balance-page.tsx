import type { WalletType } from "@rarible/sdk-wallet"
import { Box } from "@mui/material"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { UnsupportedBlockchainWarning } from "../../components/common/unsupported-blockchain-warning"
import { useSdkContext } from "../../components/connector/sdk"
import { GetBalanceComment } from "./comments/getbalance-comment"
import { NativeBalance } from "./native-balance"

function validateConditions(blockchain: WalletType | undefined): boolean {
	return !!blockchain
}

export function BalancePage() {
	const connection = useSdkContext()
	const blockchain = connection.sdk.wallet?.walletType

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
						connection.sdk && connection.sdk.wallet && connection.walletAddress ?
							<NativeBalance
								sdk={connection.sdk}
								walletAddress={connection.walletAddress }
								wallet={connection.sdk.wallet}
							/> : null
					}
				</Box>
			</CommentedBlock>
		</Page>
	)
}
