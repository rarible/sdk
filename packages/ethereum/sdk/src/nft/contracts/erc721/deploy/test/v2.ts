import type Web3 from "web3"
import { erc721v2Abi } from "../../v2"
import { NumberDataFormat } from "../../../../../common/contracts"

export async function deployErc721V2(web3: Web3, name: string, symbol: string) {
	const empty = new web3.eth.Contract(erc721v2Abi, {}, NumberDataFormat)
	const [address] = await web3.eth.getAccounts()
	const deploy = await empty.deploy({
		data: bytecodeErc721V2,
		arguments: [
			name,
			symbol,
			"0x002ed05478c75974e08f0811517aa0e3eddc1380",
			"https://dev-api.rarible.com/contractMetadata/{address}",
			"ipfs:/",
		],
	})
	return deploy.send({ from: address, gas: "4000000" })
}

const bytecodeErc721V2 = "0x60806040523480156200001157600080fd5b506040516200355f3803806200355f833981016040819052620000349162000431565b84848383808260006200004f6001600160e01b03620001d216565b600080546001600160a01b0319166001600160a01b0383169081178255604051929350916000805160206200353f833981519152908290a350620000a36301ffc9a760e01b6001600160e01b03620001d716565b620000be632dde656160e21b6001600160e01b03620001d716565b620000d96380ac58cd60e01b6001600160e01b03620001d716565b8051620000ee90600690602084019062000320565b506200010a63e8a3d48560e01b6001600160e01b03620001d716565b5080516200012090600790602084019062000320565b506200013e905063780e9d6360e01b6001600160e01b03620001d716565b83516200015390600d90602087019062000320565b5082516200016990600e90602086019062000320565b5062000185635b5e139f60e01b6001600160e01b03620001d716565b50505050620001b36040516200019b90620005ff565b6040519081900390206001600160e01b03620001d716565b620001c7836001600160e01b036200023516565b5050505050620006fb565b335b90565b6001600160e01b031980821614156200020d5760405162461bcd60e51b815260040162000204906200061e565b60405180910390fd5b6001600160e01b0319166000908152600160208190526040909120805460ff19169091179055565b620002486001600160e01b036200027e16565b620002675760405162461bcd60e51b8152600401620002049062000630565b6200027b816001600160e01b03620002ad16565b50565b600080546001600160a01b03166200029e6001600160e01b03620001d216565b6001600160a01b031614905090565b6001600160a01b038116620002d65760405162461bcd60e51b815260040162000204906200060c565b600080546040516001600160a01b03808516939216916000805160206200353f83398151915291a3600080546001600160a01b0319166001600160a01b0392909216919091179055565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200036357805160ff191683800117855562000393565b8280016001018555821562000393579182015b828111156200039357825182559160200191906001019062000376565b50620003a1929150620003a5565b5090565b620001d491905b80821115620003a15760008155600101620003ac565b8051620003cf81620006e4565b92915050565b600082601f830112620003e757600080fd5b8151620003fe620003f88262000669565b62000642565b915080825260208301602083018583830111156200041b57600080fd5b62000428838284620006b1565b50505092915050565b600080600080600060a086880312156200044a57600080fd5b85516001600160401b038111156200046157600080fd5b6200046f88828901620003d5565b95505060208601516001600160401b038111156200048c57600080fd5b6200049a88828901620003d5565b9450506040620004ad88828901620003c2565b93505060608601516001600160401b03811115620004ca57600080fd5b620004d888828901620003d5565b92505060808601516001600160401b03811115620004f557600080fd5b6200050388828901620003d5565b9150509295509295909350565b60006200051f60268362000691565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206181526564647265737360d01b602082015260400192915050565b600062000569601c8362000691565b7f4552433136353a20696e76616c696420696e7465726661636520696400000000815260200192915050565b6000620005a460208362000691565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572815260200192915050565b6000620005df6011836200069a565b704d494e545f574954485f4144445245535360781b815260110192915050565b6000620003cf82620005d0565b60208082528101620003cf8162000510565b60208082528101620003cf816200055a565b60208082528101620003cf8162000595565b6040518181016001600160401b03811182821017156200066157600080fd5b604052919050565b60006001600160401b038211156200068057600080fd5b506020601f91909101601f19160190565b90815260200190565b919050565b60006001600160a01b038216620003cf565b60005b83811015620006ce578181015183820152602001620006b4565b83811115620006de576000848401525b50505050565b620006ef816200069f565b81146200027b57600080fd5b612e34806200070b6000396000f3fe608060405234801561001057600080fd5b50600436106101cf5760003560e01c806370a0823111610104578063a22cb465116100a2578063c87b56dd11610071578063c87b56dd146103c9578063e8a3d485146103dc578063e985e9c5146103e4578063f2fde38b146103f7576101cf565b8063a22cb4651461037b578063b88d4fde1461038e578063b9c4d9fb146103a1578063c0ac9983146103c1576101cf565b80638f32d59b116100de5780638f32d59b14610345578063938e3d7b1461034d57806395d89b411461036057806399e0dd7c14610368576101cf565b806370a0823114610322578063715018a6146103355780638da5cb5b1461033d576101cf565b80632f745c59116101715780634f6ccce71161014b5780634f6ccce7146102c85780636308f1cd146102db5780636352211e146102fc578063672a94001461030f576101cf565b80632f745c591461028f57806342842e0e146102a257806342966c68146102b5576101cf565b8063095ea7b3116101ad578063095ea7b3146102325780630ebd4c7f1461024757806318160ddd1461026757806323b872dd1461027c576101cf565b806301ffc9a7146101d457806306fdde03146101fd578063081812fc14610212575b600080fd5b6101e76101e2366004611fda565b61040a565b6040516101f49190612a7f565b60405180910390f35b610205610429565b6040516101f49190612acb565b61022561022036600461204b565b6104b7565b6040516101f491906129f0565b610245610240366004611faa565b610503565b005b61025a61025536600461204b565b6105e8565b6040516101f49190612a6e565b61026f6106db565b6040516101f49190612c5c565b61024561028a366004611eb4565b6106e2565b61026f61029d366004611faa565b61071f565b6102456102b0366004611eb4565b610780565b6102456102c336600461204b565b61079b565b61026f6102d636600461204b565b6107ce565b6102ee6102e9366004612069565b610815565b6040516101f4929190612a42565b61022561030a36600461204b565b610858565b61024561031d366004612088565b61088d565b61026f610330366004611e5c565b610958565b6102456109a1565b610225610a0f565b6101e7610a1e565b61024561035b366004612016565b610a42565b610205610a6f565b610245610376366004612016565b610aca565b610245610389366004611f7a565b610af7565b61024561039c366004611f01565b610bc5565b6103b46103af36600461204b565b610c04565b6040516101f49190612a5d565b610205610cfc565b6102056103d736600461204b565b610d57565b610205610d87565b6101e76103f2366004611e7a565b610de2565b610245610405366004611e5c565b610e10565b6001600160e01b03191660009081526001602052604090205460ff1690565b600d805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156104af5780601f10610484576101008083540402835291602001916104af565b820191906000526020600020905b81548152906001019060200180831161049257829003601f168201915b505050505081565b60006104c282610e3d565b6104e75760405162461bcd60e51b81526004016104de90612bac565b60405180910390fd5b506000908152600360205260409020546001600160a01b031690565b600061050e82610858565b9050806001600160a01b0316836001600160a01b031614156105425760405162461bcd60e51b81526004016104de90612bfc565b806001600160a01b0316610554610e5a565b6001600160a01b031614806105705750610570816103f2610e5a565b61058c5760405162461bcd60e51b81526004016104de90612b6c565b60008281526003602052604080822080546001600160a01b0319166001600160a01b0387811691821790925591518593918516917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591a4505050565b6000818152600f602090815260408083208054825181850281018501909352808352606094859484015b8282101561065a576000848152602090819020604080518082019091526002850290910180546001600160a01b03168252600190810154828401529083529092019101610612565b5050505090506060815160405190808252806020026020018201604052801561068d578160200160208202803883390190505b50905060005b82518110156106d3578281815181106106a857fe5b6020026020010151602001518282815181106106c057fe5b6020908102919091010152600101610693565b509392505050565b600b545b90565b6106f36106ed610e5a565b82610e5e565b61070f5760405162461bcd60e51b81526004016104de90612c0c565b61071a838383610ee3565b505050565b600061072a83610958565b82106107485760405162461bcd60e51b81526004016104de90612aec565b6001600160a01b038316600090815260096020526040902080548390811061076c57fe5b906000526020600020015490505b92915050565b61071a83838360405180602001604052806000815250610bc5565b6107a66106ed610e5a565b6107c25760405162461bcd60e51b81526004016104de90612c4c565b6107cb81610f02565b50565b60006107d86106db565b82106107f65760405162461bcd60e51b81526004016104de90612c1c565b600b828154811061080357fe5b90600052602060002001549050919050565b600f602052816000526040600020818154811061082e57fe5b6000918252602090912060029091020180546001909101546001600160a01b039091169250905082565b6000818152600260205260408120546001600160a01b03168061077a5760405162461bcd60e51b81526004016104de90612b8c565b600130876040516020016108a29291906129ca565b60405160208183030381529060405280519060200120868686604051600081526020016040526040516108d89493929190612a8d565b6020604051602081039080840390855afa1580156108fa573d6000803e3d6000fd5b505050602060405103516001600160a01b0316610915610a0f565b6001600160a01b03161461093b5760405162461bcd60e51b81526004016104de90612b5c565b610946338784610f14565b6109508682611139565b505050505050565b60006001600160a01b0382166109805760405162461bcd60e51b81526004016104de90612b7c565b6001600160a01b038216600090815260046020526040902061077a9061116c565b6109a9610a1e565b6109c55760405162461bcd60e51b81526004016104de90612bcc565b600080546040516001600160a01b03909116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908390a3600080546001600160a01b0319169055565b6000546001600160a01b031690565b600080546001600160a01b0316610a33610e5a565b6001600160a01b031614905090565b610a4a610a1e565b610a665760405162461bcd60e51b81526004016104de90612bcc565b6107cb81611170565b600e805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156104af5780601f10610484576101008083540402835291602001916104af565b610ad2610a1e565b610aee5760405162461bcd60e51b81526004016104de90612bcc565b6107cb81611183565b610aff610e5a565b6001600160a01b0316826001600160a01b03161415610b305760405162461bcd60e51b81526004016104de90612b3c565b8060056000610b3d610e5a565b6001600160a01b03908116825260208083019390935260409182016000908120918716808252919093529120805460ff191692151592909217909155610b81610e5a565b6001600160a01b03167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3183604051610bb99190612a7f565b60405180910390a35050565b610bd6610bd0610e5a565b83610e5e565b610bf25760405162461bcd60e51b81526004016104de90612c0c565b610bfe84848484611196565b50505050565b6000818152600f602090815260408083208054825181850281018501909352808352606094859484015b82821015610c76576000848152602090819020604080518082019091526002850290910180546001600160a01b03168252600190810154828401529083529092019101610c2e565b50505050905060608151604051908082528060200260200182016040528015610ca9578160200160208202803883390190505b50905060005b82518110156106d357828181518110610cc457fe5b602002602001015160000151828281518110610cdc57fe5b6001600160a01b0390921660209283029190910190910152600101610caf565b6007805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156104af5780601f10610484576101008083540402835291602001916104af565b6060610d6282610e3d565b610d7e5760405162461bcd60e51b81526004016104de90612bec565b61077a826111c9565b6006805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156104af5780601f10610484576101008083540402835291602001916104af565b6001600160a01b03918216600090815260056020908152604080832093909416825291909152205460ff1690565b610e18610a1e565b610e345760405162461bcd60e51b81526004016104de90612bcc565b6107cb81611304565b6000908152600260205260409020546001600160a01b0316151590565b3390565b6000610e6982610e3d565b610e855760405162461bcd60e51b81526004016104de90612b4c565b6000610e9083610858565b9050806001600160a01b0316846001600160a01b03161480610ecb5750836001600160a01b0316610ec0846104b7565b6001600160a01b0316145b80610edb5750610edb8185610de2565b949350505050565b610eee838383611385565b610ef8838261148b565b61071a8282611579565b6107cb610f0e82610858565b826115b7565b610f1e83836115ca565b60608151604051908082528060200260200182016040528015610f4b578160200160208202803883390190505b50905060608251604051908082528060200260200182016040528015610f7b578160200160208202803883390190505b50905060005b83518110156110ee5760006001600160a01b0316848281518110610fa157fe5b6020026020010151600001516001600160a01b03161415610fd45760405162461bcd60e51b81526004016104de90612c3c565b838181518110610fe057fe5b6020026020010151602001516000141561100c5760405162461bcd60e51b81526004016104de90612adc565b6000858152600f60205260409020845185908390811061102857fe5b602090810291909101810151825460018082018555600094855293839020825160029092020180546001600160a01b0319166001600160a01b03909216919091178155910151910155835184908290811061107f57fe5b60200260200101516000015183828151811061109757fe5b60200260200101906001600160a01b031690816001600160a01b0316815250508381815181106110c357fe5b6020026020010151602001518282815181106110db57fe5b6020908102919091010152600101610f81565b50825115611132577f99aba1d63749cfd5ad1afda7c4663840924d54eb5f005bbbeadedc6ec13674b284838360405161112993929190612c6a565b60405180910390a15b5050505050565b61114282610e3d565b61115e5760405162461bcd60e51b81526004016104de90612bbc565b61116882826115e7565b5050565b5490565b8051611168906006906020840190611c07565b8051611168906007906020840190611c07565b6111a1848484610ee3565b6111ad84848484611606565b610bfe5760405162461bcd60e51b81526004016104de90612afc565b6000818152600860209081526040918290208054835160026001831615610100026000190190921691909104601f810184900484028201840190945283815260609361077a939192918301828280156112635780601f1061123857610100808354040283529160200191611263565b820191906000526020600020905b81548152906001019060200180831161124657829003601f168201915b505060078054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152955091935091508301828280156112f15780601f106112c6576101008083540402835291602001916112f1565b820191906000526020600020905b8154815290600101906020018083116112d457829003601f168201915b505050505061174090919063ffffffff16565b6001600160a01b03811661132a5760405162461bcd60e51b81526004016104de90612b0c565b600080546040516001600160a01b03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a3600080546001600160a01b0319166001600160a01b0392909216919091179055565b826001600160a01b031661139882610858565b6001600160a01b0316146113be5760405162461bcd60e51b81526004016104de90612bdc565b6001600160a01b0382166113e45760405162461bcd60e51b81526004016104de90612b2c565b6113ed81611835565b6001600160a01b038316600090815260046020526040902061140e90611870565b6001600160a01b038216600090815260046020526040902061142f90611887565b60008181526002602052604080822080546001600160a01b0319166001600160a01b0386811691821790925591518493918716917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4505050565b6001600160a01b0382166000908152600960205260408120546114b590600163ffffffff61189016565b6000838152600a6020526040902054909150808214611550576001600160a01b03841660009081526009602052604081208054849081106114f257fe5b906000526020600020015490508060096000876001600160a01b03166001600160a01b03168152602001908152602001600020838154811061153057fe5b6000918252602080832090910192909255918252600a9052604090208190555b6001600160a01b0384166000908152600960205260409020805490611132906000198301611c85565b6001600160a01b0390911660009081526009602081815260408084208054868652600a84529185208290559282526001810183559183529091200155565b6115c182826118d9565b61116881611905565b6115d48282611943565b6115de8282611579565b61116881611a0a565b6000828152600860209081526040909120825161071a92840190611c07565b600061161a846001600160a01b0316611a4e565b61162657506001610edb565b600060606001600160a01b038616630a85bd0160e11b611644610e5a565b89888860405160240161165a94939291906129fe565b60408051601f198184030181529181526020820180516001600160e01b03166001600160e01b031990941693909317909252905161169891906129be565b6000604051808303816000865af19150503d80600081146116d5576040519150601f19603f3d011682016040523d82523d6000602084013e6116da565b606091505b50915091508161170c578051156116f45780518082602001fd5b60405162461bcd60e51b81526004016104de90612afc565b6000818060200190516117229190810190611ff8565b6001600160e01b031916630a85bd0160e11b149350610edb92505050565b6060808390506060839050606081518351016040519080825280601f01601f19166020018201604052801561177c576020820181803883390190505b5090506000805b84518110156117d45784818151811061179857fe5b602001015160f81c60f81b8383806001019450815181106117b557fe5b60200101906001600160f81b031916908160001a905350600101611783565b5060005b8351811015611829578381815181106117ed57fe5b602001015160f81c60f81b83838060010194508151811061180a57fe5b60200101906001600160f81b031916908160001a9053506001016117d8565b50909695505050505050565b6000818152600360205260409020546001600160a01b0316156107cb57600090815260036020526040902080546001600160a01b0319169055565b805461188390600163ffffffff61189016565b9055565b80546001019055565b60006118d283836040518060400160405280601e81526020017f536166654d6174683a207375627472616374696f6e206f766572666c6f770000815250611a87565b9392505050565b6118e38282611ab3565b6118ed828261148b565b6000818152600a602052604081205561116881611b6b565b60008181526008602052604090205460026000196101006001841615020190911604156107cb5760008181526008602052604081206107cb91611ca9565b6001600160a01b0382166119695760405162461bcd60e51b81526004016104de90612b9c565b61197281610e3d565b1561198f5760405162461bcd60e51b81526004016104de90612b1c565b600081815260026020908152604080832080546001600160a01b0319166001600160a01b0387169081179091558352600490915290206119ce90611887565b60405181906001600160a01b038416906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b600b80546000838152600c60205260408120829055600182018355919091527f0175b7a638427703f0dbe7bb9bbf987a2551717b34e79f33b5b1008d1fa01db90155565b6000813f7fc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470818114801590610edb575050151592915050565b60008184841115611aab5760405162461bcd60e51b81526004016104de9190612acb565b505050900390565b816001600160a01b0316611ac682610858565b6001600160a01b031614611aec5760405162461bcd60e51b81526004016104de90612c2c565b611af581611835565b6001600160a01b0382166000908152600460205260409020611b1690611870565b60008181526002602052604080822080546001600160a01b0319169055518291906001600160a01b038516907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908390a45050565b600b54600090611b8290600163ffffffff61189016565b6000838152600c6020526040812054600b8054939450909284908110611ba457fe5b9060005260206000200154905080600b8381548110611bbf57fe5b6000918252602080832090910192909255828152600c90915260409020829055600b805490611bf2906000198301611c85565b505050600091825250600c6020526040812055565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10611c4857805160ff1916838001178555611c75565b82800160010185558215611c75579182015b82811115611c75578251825591602001919060010190611c5a565b50611c81929150611ce9565b5090565b81548183558181111561071a5760008381526020902061071a918101908301611ce9565b50805460018160011615610100020316600290046000825580601f10611ccf57506107cb565b601f0160209004906000526020600020908101906107cb91905b6106df91905b80821115611c815760008155600101611cef565b803561077a81612db9565b600082601f830112611d1f57600080fd5b8135611d32611d2d82612cc5565b612c9e565b91508181835260208401935060208101905083856040840282011115611d5757600080fd5b60005b83811015611d855781611d6d8882611e0a565b84525060209092019160409190910190600101611d5a565b5050505092915050565b803561077a81612dcd565b803561077a81612dd6565b803561077a81612ddf565b805161077a81612ddf565b600082601f830112611dcc57600080fd5b8135611dda611d2d82612ce6565b91508082526020830160208301858383011115611df657600080fd5b611e01838284612d60565b50505092915050565b600060408284031215611e1c57600080fd5b611e266040612c9e565b90506000611e348484611d03565b8252506020611e4584848301611d9a565b60208301525092915050565b803561077a81612de8565b600060208284031215611e6e57600080fd5b6000610edb8484611d03565b60008060408385031215611e8d57600080fd5b6000611e998585611d03565b9250506020611eaa85828601611d03565b9150509250929050565b600080600060608486031215611ec957600080fd5b6000611ed58686611d03565b9350506020611ee686828701611d03565b9250506040611ef786828701611d9a565b9150509250925092565b60008060008060808587031215611f1757600080fd5b6000611f238787611d03565b9450506020611f3487828801611d03565b9350506040611f4587828801611d9a565b925050606085013567ffffffffffffffff811115611f6257600080fd5b611f6e87828801611dbb565b91505092959194509250565b60008060408385031215611f8d57600080fd5b6000611f998585611d03565b9250506020611eaa85828601611d8f565b60008060408385031215611fbd57600080fd5b6000611fc98585611d03565b9250506020611eaa85828601611d9a565b600060208284031215611fec57600080fd5b6000610edb8484611da5565b60006020828403121561200a57600080fd5b6000610edb8484611db0565b60006020828403121561202857600080fd5b813567ffffffffffffffff81111561203f57600080fd5b610edb84828501611dbb565b60006020828403121561205d57600080fd5b6000610edb8484611d9a565b6000806040838503121561207c57600080fd5b6000611fc98585611d9a565b60008060008060008060c087890312156120a157600080fd5b60006120ad8989611d9a565b96505060206120be89828a01611e51565b95505060406120cf89828a01611d9a565b94505060606120e089828a01611d9a565b935050608087013567ffffffffffffffff8111156120fd57600080fd5b61210989828a01611d0e565b92505060a087013567ffffffffffffffff81111561212657600080fd5b61213289828a01611dbb565b9150509295509295509295565b600061214b838361215f565b505060200190565b600061214b838361226c565b61216881612d26565b82525050565b600061217982612d14565b6121838185612d18565b935061218e83612d0e565b8060005b838110156121bc5781516121a6888261213f565b97506121b183612d0e565b925050600101612192565b509495945050505050565b60006121d282612d14565b6121dc8185612d18565b93506121e783612d0e565b8060005b838110156121bc5781516121ff888261213f565b975061220a83612d0e565b9250506001016121eb565b600061222082612d14565b61222a8185612d18565b935061223583612d0e565b8060005b838110156121bc57815161224d8882612153565b975061225883612d0e565b925050600101612239565b61216881612d31565b612168816106df565b600061228082612d14565b61228a8185612d18565b935061229a818560208601612d6c565b6122a381612da9565b9093019392505050565b60006122b882612d14565b6122c28185612d21565b93506122d2818560208601612d6c565b9290920192915050565b6121686122e882612d55565b612d98565b60006122fa601c83612d18565b7f4665652076616c75652073686f756c6420626520706f73697469766500000000815260200192915050565b6000612333602b83612d18565b7f455243373231456e756d657261626c653a206f776e657220696e646578206f7581526a74206f6620626f756e647360a81b602082015260400192915050565b6000612380603283612d18565b7f4552433732313a207472616e7366657220746f206e6f6e20455243373231526581527131b2b4bb32b91034b6b83632b6b2b73a32b960711b602082015260400192915050565b60006123d4602683612d18565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206181526564647265737360d01b602082015260400192915050565b600061241c601c83612d18565b7f4552433732313a20746f6b656e20616c7265616479206d696e74656400000000815260200192915050565b6000612455602483612d18565b7f4552433732313a207472616e7366657220746f20746865207a65726f206164648152637265737360e01b602082015260400192915050565b600061249b601983612d18565b7f4552433732313a20617070726f766520746f2063616c6c657200000000000000815260200192915050565b60006124d4602c83612d18565b7f4552433732313a206f70657261746f7220717565727920666f72206e6f6e657881526b34b9ba32b73a103a37b5b2b760a11b602082015260400192915050565b6000612522601983612d18565b7f6f776e65722073686f756c64207369676e20746f6b656e496400000000000000815260200192915050565b600061255b603883612d18565b7f4552433732313a20617070726f76652063616c6c6572206973206e6f74206f7781527f6e6572206e6f7220617070726f76656420666f7220616c6c0000000000000000602082015260400192915050565b60006125ba602a83612d18565b7f4552433732313a2062616c616e636520717565727920666f7220746865207a65815269726f206164647265737360b01b602082015260400192915050565b6000612606602983612d18565b7f4552433732313a206f776e657220717565727920666f72206e6f6e657869737481526832b73a103a37b5b2b760b91b602082015260400192915050565b6000612651602083612d18565b7f4552433732313a206d696e7420746f20746865207a65726f2061646472657373815260200192915050565b600061268a602c83612d18565b7f4552433732313a20617070726f76656420717565727920666f72206e6f6e657881526b34b9ba32b73a103a37b5b2b760a11b602082015260400192915050565b60006126d8602c83612d18565b7f4552433732314d657461646174613a2055524920736574206f66206e6f6e657881526b34b9ba32b73a103a37b5b2b760a11b602082015260400192915050565b6000612726602083612d18565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572815260200192915050565b600061275f602983612d18565b7f4552433732313a207472616e73666572206f6620746f6b656e2074686174206981526839903737ba1037bbb760b91b602082015260400192915050565b60006127aa602f83612d18565b7f4552433732314d657461646174613a2055524920717565727920666f72206e6f81526e3732bc34b9ba32b73a103a37b5b2b760891b602082015260400192915050565b60006127fb602183612d18565b7f4552433732313a20617070726f76616c20746f2063757272656e74206f776e658152603960f91b602082015260400192915050565b600061283e603183612d18565b7f4552433732313a207472616e736665722063616c6c6572206973206e6f74206f8152701ddb995c881b9bdc88185c1c1c9bdd9959607a1b602082015260400192915050565b6000612891602c83612d18565b7f455243373231456e756d657261626c653a20676c6f62616c20696e646578206f81526b7574206f6620626f756e647360a01b602082015260400192915050565b60006128df602583612d18565b7f4552433732313a206275726e206f6620746f6b656e2074686174206973206e6f8152643a1037bbb760d91b602082015260400192915050565b6000612926601b83612d18565b7f526563697069656e742073686f756c642062652070726573656e740000000000815260200192915050565b600061295f603083612d18565b7f4552433732314275726e61626c653a2063616c6c6572206973206e6f74206f7781526f1b995c881b9bdc88185c1c1c9bdd995960821b602082015260400192915050565b6121686129b0826106df565b6106df565b61216881612d4f565b60006118d282846122ad565b60006129d682856122dc565b6014820191506129e682846129a4565b5060200192915050565b6020810161077a828461215f565b60808101612a0c828761215f565b612a19602083018661215f565b612a26604083018561226c565b8181036060830152612a388184612275565b9695505050505050565b60408101612a50828561215f565b6118d2602083018461226c565b602080825281016118d281846121c7565b602080825281016118d28184612215565b6020810161077a8284612263565b60808101612a9b828761226c565b612aa860208301866129b5565b612ab5604083018561226c565b612ac2606083018461226c565b95945050505050565b602080825281016118d28184612275565b6020808252810161077a816122ed565b6020808252810161077a81612326565b6020808252810161077a81612373565b6020808252810161077a816123c7565b6020808252810161077a8161240f565b6020808252810161077a81612448565b6020808252810161077a8161248e565b6020808252810161077a816124c7565b6020808252810161077a81612515565b6020808252810161077a8161254e565b6020808252810161077a816125ad565b6020808252810161077a816125f9565b6020808252810161077a81612644565b6020808252810161077a8161267d565b6020808252810161077a816126cb565b6020808252810161077a81612719565b6020808252810161077a81612752565b6020808252810161077a8161279d565b6020808252810161077a816127ee565b6020808252810161077a81612831565b6020808252810161077a81612884565b6020808252810161077a816128d2565b6020808252810161077a81612919565b6020808252810161077a81612952565b6020810161077a828461226c565b60608101612c78828661226c565b8181036020830152612c8a818561216e565b90508181036040830152612ac28184612215565b60405181810167ffffffffffffffff81118282101715612cbd57600080fd5b604052919050565b600067ffffffffffffffff821115612cdc57600080fd5b5060209081020190565b600067ffffffffffffffff821115612cfd57600080fd5b506020601f91909101601f19160190565b60200190565b5190565b90815260200190565b919050565b600061077a82612d43565b151590565b6001600160e01b03191690565b6001600160a01b031690565b60ff1690565b600061077a82612d26565b82818337506000910152565b60005b83811015612d87578181015183820152602001612d6f565b83811115610bfe5750506000910152565b600061077a82600061077a82612db3565b601f01601f191690565b60601b90565b612dc281612d26565b81146107cb57600080fd5b612dc281612d31565b612dc2816106df565b612dc281612d36565b612dc281612d4f56fea365627a7a723158207b86529ee5285f2fd349b9bd26121704afed6414c32b9f9344963e1850afb1ce6c6578706572696d656e74616cf564736f6c634300051100408be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0"
