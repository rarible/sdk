import { ERC721TokenType } from "@imtbl/imx-sdk"
import type { Link } from "@imtbl/imx-sdk"
import type { Maybe } from "@rarible/types"
import type { TransferRequest, TransferResponse } from "./domain"
import { getTransferResponse } from "./common/get-tranfer-response"

export async function transfer(
	link: Maybe<Link>,
	request: TransferRequest,
): Promise<TransferResponse> {
	if (link === undefined) {
		throw new Error("Wallet undefined")
	}
	const { assetClass, contract, tokenId, to } = request
	if (assetClass !== ERC721TokenType.ERC721) {
		throw new Error("Unsupported assetClass")
	}
	const { result } = await link.transfer([{
		type: ERC721TokenType.ERC721,
		tokenId,
		tokenAddress: contract,
		toAddress: to,
	}])
	if (!result || !result[0]) {
		throw new Error(`Imx transfer error: result is empty (${JSON.stringify(result)})`)
	}
	const resp = result[0]
	return getTransferResponse(resp)
}
