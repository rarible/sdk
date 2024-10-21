export const EIP721_NFT_TYPE = "MintAndTransfer"
export const NFT_DOMAIN_TYPE = [
  { type: "string", name: "name" },
  { type: "string", name: "version" },
  { type: "uint256", name: "chainId" },
  { type: "address", name: "verifyingContract" },
]
export const EIP721_NFT_TYPES = {
  EIP712Domain: NFT_DOMAIN_TYPE,
  Part: [
    { name: "account", type: "address" },
    { name: "value", type: "uint96" },
  ],
  MintAndTransfer: [
    { name: "tokenId", type: "uint256" },
    { name: "uri", type: "string" },
    { name: "creators", type: "Part[]" },
    { name: "royalties", type: "Part[]" },
  ],
}

export const EIP721_DOMAIN_NFT_NAME = "MintAndTransfer"
export const EIP721_DOMAIN_NFT_VERSION = "1"
export const EIP721_DOMAIN_NFT_TEMPLATE = {
  name: EIP721_DOMAIN_NFT_NAME,
  version: EIP721_DOMAIN_NFT_VERSION,
}
