export interface EthereumProviderConnectionResult {
  provider: any
  chainId: number
  address: string
  disconnect?: () => void
}
