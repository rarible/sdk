### approve

Check approval for specific Asset and executes approve | setApprovalForAll if needed

Arguments:

- owner: EVMAddress - owner of the Asset
- asset: Asset - asset to check for approval
- infinite: boolean - set infinite approval (only for ERC20AssetType)

This function checks type of the asset and executes one of these functions:

- approveErc20
- approveErc721
- approveErc1155

Operator is calculated this way:

- erc20TransferProxy is used for erc-20
- transferProxy is used for erc-721 and erc-1155
- erc721LazyMintTransferProxy is used for lazy erc-721
- erc1155LazyMintTransferProxy is used for lazy erc-1155
