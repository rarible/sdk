import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { CreateCollectionResponse, CreateCollectionRequest } from "@rarible/sdk/src/types/nft/deploy/domain"

/**
 * Deploy new collection, await transaction, check address
 */
export async function deployCollection(sdk: IRaribleSdk,
									   wallet: BlockchainWallet,
									   deployRequest: CreateCollectionRequest): Promise<CreateCollectionResponse> {
	console.log("Deploying collection, deploy_token_request=", deployRequest)
	const deployResult = await sdk.nft.deploy(deployRequest)
	await deployResult.tx.wait()

	expect(deployResult.address).toBeTruthy()
	expect(typeof deployResult.address).toBe("string")
	console.log("Deploy result=", deployResult)
	return deployResult
}
