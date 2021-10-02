
import { ethers } from "hardhat"

import { BigNumber } from "ethers"
import { sha256 } from "ethers/lib/utils"

import { Tux } from "../typechain"

import {
  Auctions,
  BadBidder,
  BadERC721,
  TestERC721,
} from "../typechain"

export const THOUSANDTH_ETH = ethers.utils.parseUnits("0.001", "ether") as BigNumber
export const TENTH_ETH = ethers.utils.parseUnits("0.1", "ether") as BigNumber
export const ONE_ETH = ethers.utils.parseUnits("1", "ether") as BigNumber
export const TWO_ETH = ethers.utils.parseUnits("2", "ether") as BigNumber
export const TOKEN_URI = 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
export const TOKEN_URI_TWO = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'


export const deployOtherNFTs = async () => {
  const bad = (await (
    await ethers.getContractFactory('contracts/test/BadERC721.sol:BadERC721')
  ).deploy()) as BadERC721

  const test = (await (
    await ethers.getContractFactory('contracts/test/TestERC721.sol:TestERC721')
  ).deploy()) as TestERC721

  return { bad, test }
}

export const deployTux = async () => {
  const [deployer] = await ethers.getSigners()

  const Tux = await ethers.getContractFactory('contracts/Tux.sol:Tux')
  const tux = await (
    await Tux.connect(deployer).deploy('tux', 'TUX')
  ).deployed()

  return tux
}

export const deployBidder = async (auction: string, contract: string) => {
  return (await (
    await (await ethers.getContractFactory('contracts/test/BadBidder.sol:BadBidder')).deploy(
      auction,
      contract
    )
  ).deployed()) as BadBidder
}

export const mint = async (tux: Tux) => {
  await tux.mint(TOKEN_URI)
}

export const approveAuctions = async (
  tux: Tux,
  auctions: Auctions
) => {
  await tux.setApprovalForAll(auctions.address, true)
}

export const revert = (messages: TemplateStringsArray) =>
  `VM Exception while processing transaction: reverted with reason string '${messages[0]}'`
