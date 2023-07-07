import Web3 from "web3"
import { awaitAll, createGanacheProvider, deployWethContract } from "@rarible/ethereum-sdk-test-common"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toAddress } from "@rarible/types"
import { toBn } from "@rarible/utils"
import { getSimpleSendWithInjects } from "../common/send-transaction"
import { getEthereumConfig } from "../config"
import { ConvertWeth } from "./convert-weth"
import { createWethContract } from "./contracts/weth"
import { checkChainId } from "./check-chain-id"

describe("convert weth test", () => {
	const { addresses, provider } = createGanacheProvider()
	const [sender1Address] = addresses
	const web3 = new Web3(provider as any)
	const ethereum = new Web3Ethereum({ web3, from: sender1Address, gas: 1000000 })
	const config = getEthereumConfig("dev-ethereum")

	const checkWalletChainId = checkChainId.bind(null, ethereum, config)
	const send = getSimpleSendWithInjects().bind(null, checkWalletChainId)
	const converter = new ConvertWeth(ethereum, send, config)

	const it = awaitAll({
		deployWeth: deployWethContract(web3),
	})

	test("convert eth to weth test", async () => {
		config.weth = toAddress(it.deployWeth.options.address)

		const contract = createWethContract(ethereum, toAddress(it.deployWeth.options.address))

		const startEthBalance = await web3.eth.getBalance(sender1Address)
		const startBalance = await contract.functionCall("balanceOf", sender1Address).call()

		const tx = await converter.convert(
			{ assetClass: "ETH" },
			{ assetClass: "ERC20", contract: converter.getWethContractAddress() },
			toBn("0.1"),
		)
		await tx.wait()

		const finishBalance = await contract.functionCall("balanceOf", sender1Address).call()
		const finishEthBalance = await web3.eth.getBalance(sender1Address)

		const diff = toBn(finishBalance).minus(startBalance)
		const diffInEth = toBn(startEthBalance).minus(finishEthBalance)

		expect(diff.toString()).toBe("100000000000000000")
		expect(diffInEth.gte("100000000000000000")).toBeTruthy()
	})

	test("convert weth to eth test", async () => {
		config.weth = toAddress(it.deployWeth.options.address)
		const contract = createWethContract(ethereum, toAddress(it.deployWeth.options.address))
		const tx = await converter.convert(
			{ assetClass: "ETH" },
			{ assetClass: "ERC20", contract: converter.getWethContractAddress() },
			toBn("0.2")
		)
		await tx.wait()

		const initWethBalance = await contract.functionCall("balanceOf", sender1Address).call()
		const tx1 = await converter.convert(
			{ assetClass: "ERC20", contract: converter.getWethContractAddress() },
			{ assetClass: "ETH" },
			toBn("0.1")
		)
		await tx1.wait()

		const finishWethBalance = await contract.functionCall("balanceOf", sender1Address).call()
		const diff = toBn(initWethBalance).minus(finishWethBalance)
		expect(diff.toString()).toBe("100000000000000000")
	})

	test("should throw error in case of unsupported contract", async () => {
		const fakeAddress = toAddress("0x0000000000000000000000000000000000000000")
		expect(() => converter.convert(
			{ assetClass: "ETH" },
			{ assetClass: "ERC20", contract: fakeAddress },
			toBn("0.1")
		)).rejects.toThrowError(`Contract is not supported - ${fakeAddress}`)
	})
})
