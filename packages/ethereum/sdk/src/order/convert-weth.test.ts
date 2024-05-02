import { awaitAll, createGanacheProvider, deployWethContract } from "@rarible/ethereum-sdk-test-common"
import { toAddress } from "@rarible/types"
import { toBn } from "@rarible/utils"
import { getSimpleSendWithInjects } from "../common/send-transaction"
import { getEthereumConfig } from "../config"
import { createEthereumProviders } from "../common/test/create-test-providers"
import { ConvertWeth } from "./convert-weth"
import { createWethContract } from "./contracts/weth"

const { provider, addresses, wallets } = createGanacheProvider()
const { providers, web3v4 } = createEthereumProviders(provider, wallets[0])

/**
 * @group provider/ganache
 */
describe.each(providers)("convert weth test", (ethereum) => {
	const [sender1Address] = addresses
	const config = getEthereumConfig("dev-ethereum")
	const getConfig = async () => config

	const send = getSimpleSendWithInjects()
	const converter = new ConvertWeth(ethereum, send, getConfig)

	const it = awaitAll({
		deployWeth: deployWethContract(web3v4),
	})

	test(`[${ethereum.constructor.name}] convert eth to weth test`, async () => {
		config.weth = toAddress(it.deployWeth.options.address!)

		const contract = createWethContract(ethereum, toAddress(it.deployWeth.options.address!))

		const startEthBalance = await ethereum.getBalance(sender1Address)
		const startBalance = await contract.functionCall("balanceOf", sender1Address).call()

		const tx = await converter.convert(
			{ assetClass: "ETH" },
			{ assetClass: "ERC20", contract: await converter.getWethContractAddress() },
			toBn("0.1"),
		)
		await tx.wait()

		const finishBalance = await contract.functionCall("balanceOf", sender1Address).call()
		const finishEthBalance = await ethereum.getBalance(sender1Address)

		const diff = toBn(finishBalance).minus(startBalance.toString())
		const diffInEth = toBn(startEthBalance).minus(finishEthBalance.toString())

		expect(diff.toString()).toBe("100000000000000000")
		expect(diffInEth.gte("100000000000000000")).toBeTruthy()
	})

	test(`[${ethereum.constructor.name}]convert weth to eth test`, async () => {
		config.weth = toAddress(it.deployWeth.options.address!)
		const contract = createWethContract(ethereum, toAddress(it.deployWeth.options.address!))
		const tx = await converter.convert(
			{ assetClass: "ETH" },
			{ assetClass: "ERC20", contract: await converter.getWethContractAddress() },
			toBn("0.2")
		)
		await tx.wait()

		const initWethBalance = await contract.functionCall("balanceOf", sender1Address).call()
		const tx1 = await converter.convert(
			{ assetClass: "ERC20", contract: await converter.getWethContractAddress() },
			{ assetClass: "ETH" },
			toBn("0.1")
		)
		await tx1.wait()

		const finishWethBalance = await contract.functionCall("balanceOf", sender1Address).call()
		const diff = toBn(initWethBalance).minus(finishWethBalance.toString())
		expect(diff.toString()).toBe("100000000000000000")
	})

	test(`[${ethereum.constructor.name}] should throw error in case of unsupported contract`, async () => {
		const fakeAddress = toAddress("0x0000000000000000000000000000000000000000")
		expect(() => converter.convert(
			{ assetClass: "ETH" },
			{ assetClass: "ERC20", contract: fakeAddress },
			toBn("0.1")
		)).rejects.toThrowError(`Contract is not supported - ${fakeAddress}`)
	})
})
