import { AccountAddress } from "@aptos-labs/ts-sdk"
import { AptosMethodClass } from "../common/method"
export class AptosTransfer extends AptosMethodClass {
  transfer = async (
  	tokenAddress: string,
  	to: string
  ) => {
  	const transferTransaction = await this.aptos.transferDigitalAssetTransaction({
  		sender: this.account,
  		digitalAssetAddress: tokenAddress,
  		recipient: AccountAddress.from(to),
  	})
  	return this.sendAndWaitTx(transferTransaction)
  }
}
