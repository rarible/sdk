import { toBinary } from "@rarible/types"
import type { Binary } from "@rarible/ethereum-api-client"
import { FILL_CALLDATA_TAG } from "../../../config/common"
import type { IRaribleEthereumSdkConfig } from "../../../types"

export function getUpdatedCalldata(sdkConfig?: IRaribleEthereumSdkConfig): Binary {
  const callDataLength = 48

  if (sdkConfig?.marketplaceMarker) {
    const hexRegexp = /^[0-9a-f]*$/i
    const fillCalldata = toBinary(sdkConfig.marketplaceMarker).slice(2).toString()
    const isNotHexValue = !hexRegexp.test(fillCalldata)
    if (isNotHexValue) {
      throw new Error("MarketplaceMarker is not a hex value")
    }
    if (fillCalldata.length !== callDataLength) {
      throw new Error(`MarketplaceMarker has length = ${fillCalldata.length}, but should be = ${callDataLength}`)
    }
    return toBinary(`0x${fillCalldata}${FILL_CALLDATA_TAG}`)
  } else {
    //use default
    return toBinary(`0x${"0".repeat(callDataLength)}${FILL_CALLDATA_TAG}`)
  }
}
