import { EclipseSdk } from "../sdk/sdk"

export function createSdk(): EclipseSdk {
  return EclipseSdk.create({
    connection: {
      cluster: "testnet",
      endpoint: "https://testnet.dev2.eclipsenetwork.xyz",
      commitmentOrConfig: "confirmed",
    },
    debug: true,
  })
}
