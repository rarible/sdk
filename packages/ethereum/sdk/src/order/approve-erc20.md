### approveErc20

Checks allowance and approves ERC20 tokens if needed.

Arguments:

- contract: Address - address of the ERC20 contract
- owner: Address - owner of the ERC20 tokens
- operator: Address - operator (who will call transferFrom)
- infinite: boolean - set infinite approval (2^256 - 1) if approval is needed
