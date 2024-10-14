### approveErc721

Checks approval and calls setApprovalForAll if needed

Arguments:

- contract: EVMAddress - address of the ERC721 contract
- owner: EVMAddress - owner of the tokens
- operator: EVMAddress - operator (who will call transferFrom or safeTransferFrom)
