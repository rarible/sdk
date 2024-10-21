import type { Ownership, OwnershipId } from "@rarible/api-client"
import { toOwnershipId } from "@rarible/types"
import type { IRaribleSdk } from "../../domain"
import { waitFor } from "../wait-for"

export class OwnershipTestSuite {
  constructor(private readonly sdk: IRaribleSdk) {}

  waitForOwnership = (ownershipId: OwnershipId, predicate?: (value: Ownership) => boolean) =>
    waitFor(
      () =>
        this.sdk.apis.ownership.getOwnershipById({
          ownershipId,
        }),
      predicate,
    )

  waitForNewOwnership = (itemId: string, nextOwner: string, predicate?: (value: Ownership) => boolean) =>
    this.waitForOwnership(toOwnershipId(`${itemId}:${nextOwner}`), predicate)
}
