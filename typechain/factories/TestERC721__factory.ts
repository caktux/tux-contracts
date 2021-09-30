/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { TestERC721, TestERC721Interface } from "../TestERC721";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b50604080518082018252600a8152695465737445524337323160b01b602080830191825283518085019094526004845263151154d560e21b90840152815191929162000060916000916200007f565b508051620000769060019060208401906200007f565b50505062000162565b8280546200008d9062000125565b90600052602060002090601f016020900481019282620000b15760008555620000fc565b82601f10620000cc57805160ff1916838001178555620000fc565b82800160010185558215620000fc579182015b82811115620000fc578251825591602001919060010190620000df565b506200010a9291506200010e565b5090565b5b808211156200010a57600081556001016200010f565b600181811c908216806200013a57607f821691505b602082108114156200015c57634e487b7160e01b600052602260045260246000fd5b50919050565b6113b180620001726000396000f3fe608060405234801561001057600080fd5b50600436106100ca5760003560e01c80636352211e1161007c5780636352211e1461018557806370a082311461019857806395d89b41146101b9578063a22cb465146101c1578063b88d4fde146101d4578063c87b56dd146101e7578063e985e9c5146101fa57600080fd5b806301ffc9a7146100cf57806306fdde03146100f7578063081812fc1461010c578063095ea7b31461013757806323b872dd1461014c57806340c10f191461015f57806342842e0e14610172575b600080fd5b6100e26100dd366004611090565b61020d565b60405190151581526020015b60405180910390f35b6100ff61025f565b6040516100ee919061117b565b61011f61011a3660046110ca565b6102f1565b6040516001600160a01b0390911681526020016100ee565b61014a610145366004611066565b61037e565b005b61014a61015a366004610f12565b61048f565b61014a61016d366004611066565b6104c0565b61014a610180366004610f12565b6104ce565b61011f6101933660046110ca565b6104e9565b6101ab6101a6366004610ec4565b610560565b6040519081526020016100ee565b6100ff6105e7565b61014a6101cf36600461102a565b6105f6565b61014a6101e2366004610f4e565b6106b7565b6100ff6101f53660046110ca565b6106ef565b6100e2610208366004610edf565b6107c7565b60006001600160e01b031982166380ac58cd60e01b148061023e57506001600160e01b03198216635b5e139f60e01b145b8061025957506301ffc9a760e01b6001600160e01b03198316145b92915050565b60606000805461026e906112a0565b80601f016020809104026020016040519081016040528092919081815260200182805461029a906112a0565b80156102e75780601f106102bc576101008083540402835291602001916102e7565b820191906000526020600020905b8154815290600101906020018083116102ca57829003601f168201915b5050505050905090565b60006102fc826107f5565b6103625760405162461bcd60e51b815260206004820152602c60248201527f4552433732313a20617070726f76656420717565727920666f72206e6f6e657860448201526b34b9ba32b73a103a37b5b2b760a11b60648201526084015b60405180910390fd5b506000908152600460205260409020546001600160a01b031690565b6000610389826104e9565b9050806001600160a01b0316836001600160a01b031614156103f75760405162461bcd60e51b815260206004820152602160248201527f4552433732313a20617070726f76616c20746f2063757272656e74206f776e656044820152603960f91b6064820152608401610359565b336001600160a01b0382161480610413575061041381336107c7565b6104805760405162461bcd60e51b815260206004820152603860248201527f4552433732313a20617070726f76652063616c6c6572206973206e6f74206f776044820152771b995c881b9bdc88185c1c1c9bdd995908199bdc88185b1b60421b6064820152608401610359565b61048a8383610812565b505050565b6104993382610880565b6104b55760405162461bcd60e51b8152600401610359906111e0565b61048a83838361094a565b6104ca8282610aea565b5050565b61048a838383604051806020016040528060008152506106b7565b6000818152600260205260408120546001600160a01b0316806102595760405162461bcd60e51b815260206004820152602960248201527f4552433732313a206f776e657220717565727920666f72206e6f6e657869737460448201526832b73a103a37b5b2b760b91b6064820152608401610359565b60006001600160a01b0382166105cb5760405162461bcd60e51b815260206004820152602a60248201527f4552433732313a2062616c616e636520717565727920666f7220746865207a65604482015269726f206164647265737360b01b6064820152608401610359565b506001600160a01b031660009081526003602052604090205490565b60606001805461026e906112a0565b6001600160a01b03821633141561064b5760405162461bcd60e51b815260206004820152601960248201527822a9219b99189d1030b8383937bb32903a379031b0b63632b960391b6044820152606401610359565b3360008181526005602090815260408083206001600160a01b03871680855290835292819020805460ff191686151590811790915590519081529192917f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a35050565b6106c13383610880565b6106dd5760405162461bcd60e51b8152600401610359906111e0565b6106e984848484610b04565b50505050565b60606106fa826107f5565b61075e5760405162461bcd60e51b815260206004820152602f60248201527f4552433732314d657461646174613a2055524920717565727920666f72206e6f60448201526e3732bc34b9ba32b73a103a37b5b2b760891b6064820152608401610359565b600061077560408051602081019091526000815290565b9050600081511161079557604051806020016040528060008152506107c0565b8061079f84610b37565b6040516020016107b092919061110f565b6040516020818303038152906040525b9392505050565b6001600160a01b03918216600090815260056020908152604080832093909416825291909152205460ff1690565b6000908152600260205260409020546001600160a01b0316151590565b600081815260046020526040902080546001600160a01b0319166001600160a01b0384169081179091558190610847826104e9565b6001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b600061088b826107f5565b6108ec5760405162461bcd60e51b815260206004820152602c60248201527f4552433732313a206f70657261746f7220717565727920666f72206e6f6e657860448201526b34b9ba32b73a103a37b5b2b760a11b6064820152608401610359565b60006108f7836104e9565b9050806001600160a01b0316846001600160a01b031614806109325750836001600160a01b0316610927846102f1565b6001600160a01b0316145b80610942575061094281856107c7565b949350505050565b826001600160a01b031661095d826104e9565b6001600160a01b0316146109c55760405162461bcd60e51b815260206004820152602960248201527f4552433732313a207472616e73666572206f6620746f6b656e2074686174206960448201526839903737ba1037bbb760b91b6064820152608401610359565b6001600160a01b038216610a275760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f206164646044820152637265737360e01b6064820152608401610359565b610a32600082610812565b6001600160a01b0383166000908152600360205260408120805460019290610a5b90849061125d565b90915550506001600160a01b0382166000908152600360205260408120805460019290610a89908490611231565b909155505060008181526002602052604080822080546001600160a01b0319166001600160a01b0386811691821790925591518493918716917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4505050565b6104ca828260405180602001604052806000815250610c35565b610b0f84848461094a565b610b1b84848484610c68565b6106e95760405162461bcd60e51b81526004016103599061118e565b606081610b5b5750506040805180820190915260018152600360fc1b602082015290565b8160005b8115610b855780610b6f816112db565b9150610b7e9050600a83611249565b9150610b5f565b60008167ffffffffffffffff811115610ba057610ba061134c565b6040519080825280601f01601f191660200182016040528015610bca576020820181803683370190505b5090505b841561094257610bdf60018361125d565b9150610bec600a866112f6565b610bf7906030611231565b60f81b818381518110610c0c57610c0c611336565b60200101906001600160f81b031916908160001a905350610c2e600a86611249565b9450610bce565b610c3f8383610d75565b610c4c6000848484610c68565b61048a5760405162461bcd60e51b81526004016103599061118e565b60006001600160a01b0384163b15610d6a57604051630a85bd0160e11b81526001600160a01b0385169063150b7a0290610cac90339089908890889060040161113e565b602060405180830381600087803b158015610cc657600080fd5b505af1925050508015610cf6575060408051601f3d908101601f19168201909252610cf3918101906110ad565b60015b610d50573d808015610d24576040519150601f19603f3d011682016040523d82523d6000602084013e610d29565b606091505b508051610d485760405162461bcd60e51b81526004016103599061118e565b805181602001fd5b6001600160e01b031916630a85bd0160e11b149050610942565b506001949350505050565b6001600160a01b038216610dcb5760405162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f20616464726573736044820152606401610359565b610dd4816107f5565b15610e215760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e746564000000006044820152606401610359565b6001600160a01b0382166000908152600360205260408120805460019290610e4a908490611231565b909155505060008181526002602052604080822080546001600160a01b0319166001600160a01b03861690811790915590518392907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b80356001600160a01b0381168114610ebf57600080fd5b919050565b600060208284031215610ed657600080fd5b6107c082610ea8565b60008060408385031215610ef257600080fd5b610efb83610ea8565b9150610f0960208401610ea8565b90509250929050565b600080600060608486031215610f2757600080fd5b610f3084610ea8565b9250610f3e60208501610ea8565b9150604084013590509250925092565b60008060008060808587031215610f6457600080fd5b610f6d85610ea8565b9350610f7b60208601610ea8565b925060408501359150606085013567ffffffffffffffff80821115610f9f57600080fd5b818701915087601f830112610fb357600080fd5b813581811115610fc557610fc561134c565b604051601f8201601f19908116603f01168101908382118183101715610fed57610fed61134c565b816040528281528a602084870101111561100657600080fd5b82602086016020830137600060208483010152809550505050505092959194509250565b6000806040838503121561103d57600080fd5b61104683610ea8565b91506020830135801515811461105b57600080fd5b809150509250929050565b6000806040838503121561107957600080fd5b61108283610ea8565b946020939093013593505050565b6000602082840312156110a257600080fd5b81356107c081611362565b6000602082840312156110bf57600080fd5b81516107c081611362565b6000602082840312156110dc57600080fd5b5035919050565b600081518084526110fb816020860160208601611274565b601f01601f19169290920160200192915050565b60008351611121818460208801611274565b835190830190611135818360208801611274565b01949350505050565b6001600160a01b0385811682528416602082015260408101839052608060608201819052600090611171908301846110e3565b9695505050505050565b6020815260006107c060208301846110e3565b60208082526032908201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560408201527131b2b4bb32b91034b6b83632b6b2b73a32b960711b606082015260800190565b60208082526031908201527f4552433732313a207472616e736665722063616c6c6572206973206e6f74206f6040820152701ddb995c881b9bdc88185c1c1c9bdd9959607a1b606082015260800190565b600082198211156112445761124461130a565b500190565b60008261125857611258611320565b500490565b60008282101561126f5761126f61130a565b500390565b60005b8381101561128f578181015183820152602001611277565b838111156106e95750506000910152565b600181811c908216806112b457607f821691505b602082108114156112d557634e487b7160e01b600052602260045260246000fd5b50919050565b60006000198214156112ef576112ef61130a565b5060010190565b60008261130557611305611320565b500690565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052601260045260246000fd5b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160e01b03198116811461137857600080fd5b5056fea264697066735822122067f991a8f232b9934af561d09eb274a6db6c52eae467875611fbfd0bc8bd164b64736f6c63430008070033";

export class TestERC721__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<TestERC721> {
    return super.deploy(overrides || {}) as Promise<TestERC721>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): TestERC721 {
    return super.attach(address) as TestERC721;
  }
  connect(signer: Signer): TestERC721__factory {
    return super.connect(signer) as TestERC721__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TestERC721Interface {
    return new utils.Interface(_abi) as TestERC721Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TestERC721 {
    return new Contract(address, _abi, signerOrProvider) as TestERC721;
  }
}