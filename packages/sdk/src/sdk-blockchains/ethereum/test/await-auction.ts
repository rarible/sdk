import { IRaribleSdk } from "../../../domain";
import { ItemId } from "@rarible/api-client";
import { retry } from "../../../common/retry";

export async function awaitAuction(sdk: IRaribleSdk, itemId: ItemId) {
  return retry(5, 2000, () => sdk.apis.auction.({ itemId }))
}
