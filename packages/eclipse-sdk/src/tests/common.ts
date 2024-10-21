import { EclipseSdk } from "../sdk/sdk"

export function createSdk(): EclipseSdk {
  return EclipseSdk.create({
    connection: {
      cluster: "devnet",
      endpoint: "https://staging-rpc.dev2.eclipsenetwork.xyz",
      commitmentOrConfig: "confirmed",
    },
  })
}
