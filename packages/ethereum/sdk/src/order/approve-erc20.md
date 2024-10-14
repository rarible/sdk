### approveErc20

Checks allowance and approves ERC20 tokens if needed.

Arguments:

- contract: EVMAddress - address of the ERC20 contract
- owner: EVMAddress - owner of the ERC20 tokens
- operator: EVMAddress - operator (who will call transferFrom)
- infinite: boolean - set infinite approval (2^256 - 1) if approval is needed
