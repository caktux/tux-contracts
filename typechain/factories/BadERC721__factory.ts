/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { BadERC721, BadERC721Interface } from "../BadERC721";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "_interfaceId",
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
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5060bf8061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c806301ffc9a714602d575b600080fd5b60466038366004605a565b6001600160e01b0319161590565b604051901515815260200160405180910390f35b600060208284031215606b57600080fd5b81356001600160e01b031981168114608257600080fd5b939250505056fea264697066735822122092696094d0ac1e7417d28a7e4e5d1719d124bd7ab8caaf791ee809b1b9b2fa1664736f6c63430008070033";

export class BadERC721__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<BadERC721> {
    return super.deploy(overrides || {}) as Promise<BadERC721>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): BadERC721 {
    return super.attach(address) as BadERC721;
  }
  connect(signer: Signer): BadERC721__factory {
    return super.connect(signer) as BadERC721__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): BadERC721Interface {
    return new utils.Interface(_abi) as BadERC721Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): BadERC721 {
    return new Contract(address, _abi, signerOrProvider) as BadERC721;
  }
}