# Biconomy Provider Middleware

## Usage

```ts
    import { Registry, withBiconomyMiddleware } from "@rarible/biconomy-middleware"

    const provider = ... // an web3 provider   
    
    // contract metadata provider see IContractRegistry
    const remoteTestRegistry = new Registry("https://example.com/registry.json") 

    // applying biconomy middleware to provider 
    const biconomyProvider = withBiconomyMiddleware(provider, testRegistry, {
        apiKey: "BICONOMY_API_KEY",
    })

    // use provider with biconomy for web3 instance
    const web3 = new Web3(biconomyProvider as any)

    // create contract and use methods normally
    const contract = web3.eth.Contract(abi, contractAddress)
    const tx = await contract.methods.setApprovalForAll(contractAddress, true).send()   
```

Complete usage example can also be seen in tests