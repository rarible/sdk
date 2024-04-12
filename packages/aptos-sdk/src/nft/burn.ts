import type {
	Account,
	Aptos,
} from "@aptos-labs/ts-sdk"
import { AptosMethodClass } from "../common/method"
export class AptosBurn extends AptosMethodClass{
	constructor(readonly aptos: Aptos, readonly account: Account) {
		super(aptos, account)
	}

  burn = async (tokenAddress: string) => {
  	const tx = await this.aptos.burnDigitalAssetTransaction({
  		creator: this.account,
  		digitalAssetAddress: tokenAddress,
  	})
  	return this.sendAndWaitTx(tx)
  }
}
