### Transfer NFT token

Transfer NFT token token from sender to newOwner.

Arguments:
- owner: EVMAddress - owner of the Asset
- asset: Asset - asset to check for approval

This function checks type of the asset and executes one of these functions:
- transferErc721
- transferErc1155
