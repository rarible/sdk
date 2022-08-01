import type { Link } from "@imtbl/imx-sdk"
import type { TransferResponse } from "../domain"

export type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never
export type ImxTransferResponse = Unpromise<ReturnType<Link["transfer"]>>["result"][0]

export function getTransferResponse(r: ImxTransferResponse): TransferResponse {
	switch (r.status) {
		case "success": {
			return {
				status: r.status,
				txId: r.txId,
			}
		}
		case "error": {
			throw new Error(r.message)
		}
		default:
			throw new Error("Should never happen")
	}
}
