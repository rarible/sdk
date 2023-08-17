import { randomAddress, toAddress } from "@rarible/types"
import { awaitAll, deployTestErc20, createGanacheProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { toBn } from "@rarible/utils/build/bn"
import { Configuration, GatewayControllerApi } from "@rarible/ethereum-api-client"
import { EthersEthereum, EthersWeb3ProviderEthereum } from "@rarible/ethers-ethereum"
import { ethers } from "ethers"
import type { Ethereum } from "@rarible/ethereum-provider"
import { Web3Ethereum } from "../../../web3-ethereum"
import { getApiConfig } from "../config/api-config"
import { getSendWithInjects, sentTx } from "../common/send-transaction"
import { getEthereumConfig } from "../config"
import { approveErc20 as approveErc20Template } from "./approve-erc20"
import { checkChainId } from "./check-chain-id"
import { prependProviderName } from "./test/prepend-provider-name"

const pk = "d519f025ae44644867ee8384890c4a0b8a7b00ef844e8d64c566c0ac971c9469"
const { provider, addresses } = createGanacheProvider(pk)
const ethersWeb3Provider = new ethers.providers.Web3Provider(provider as any)
const web3 = new Web3(provider as any)

const providers = [
	new Web3Ethereum({ web3 }),
	new EthersEthereum(new ethers.Wallet(pk, ethersWeb3Provider)),
	new EthersWeb3ProviderEthereum(ethersWeb3Provider),
]

describe.each(providers)("approveErc20", (ethereum: Ethereum) => {
	const [testAddress] = addresses
	const configuration = new Configuration(getApiConfig("dev-ethereum"))
	const gatewayApi = new GatewayControllerApi(configuration)
	const config = getEthereumConfig("dev-ethereum")
	const checkWalletChainId = checkChainId.bind(null, ethereum, config)
	const send = getSendWithInjects().bind(null, gatewayApi, checkWalletChainId)
	const approveErc20 = approveErc20Template.bind(null, ethereum, send)

	const it = awaitAll({
		testErc20: deployTestErc20(web3, "TST", "TST"),
	})

	beforeAll(async () => {
		console.log("it", it.testErc20.options.address)
		await it.testErc20.methods.mint(testAddress, 100).send({ from: testAddress, gas: "200000" })
	})

	test(prependProviderName(ethereum, "should approve exact value if not infinite"), async () => {
		const operator = randomAddress()
		const tx = await approveErc20(toAddress(it.testErc20.options.address!), testAddress, operator, toBn(100), false)
		await tx?.wait()
		const result = toBn(await it.testErc20.methods.allowance(testAddress, operator).call())
		expect(result.eq(100)).toBeTruthy()
	})

	test(prependProviderName(ethereum, "should approve if value infinite"), async () => {
		const infiniteBn = toBn(2).pow(256).minus(1)

		const operator = randomAddress()
		const addressErc20 = toAddress(it.testErc20.options.address!)
		const tx = await approveErc20(addressErc20, testAddress, operator, toBn(infiniteBn), true)
		await tx?.wait()
		const result = toBn(await it.testErc20.methods.allowance(testAddress, operator).call())
		expect(result.toString()).toBe(infiniteBn.toString())
	})

	test(prependProviderName(ethereum, "should not approve if already approved"), async () => {
		const operator = randomAddress()
		const testBnValue = 200

		await sentTx(it.testErc20.methods.approve(operator, testBnValue), { from: testAddress })

		const result = await approveErc20(
			toAddress(it.testErc20.options.address!),
			testAddress,
			operator,
			toBn(testBnValue),
			false
		)

		expect(result === undefined).toBeTruthy()
	})
})
