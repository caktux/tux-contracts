import { ethers } from 'hardhat'

import chai, { expect } from 'chai'
import asPromised from 'chai-as-promised'

import { AddressZero } from '@ethersproject/constants'
import { Wallet, Signer, BigNumber } from 'ethers'
import { formatUnits } from '@ethersproject/units'
import { arrayify } from 'ethers/lib/utils'


chai.use(asPromised)

let tokenURI = 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
let tokenURI2 = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'


describe('Tux', () => {
  let deployerWallet: any = { address: '' }
  let creatorWallet: any = { address: '' }
  let otherWallet: any = { address: '' }
  let ownerWallet: any = { address: '' }
  let prevOwnerWallet: any = { address: '' }

  let defaultTokenId = 1

  let tux: any
  let tuxAddress: string

  // Utility functions
  function toNumWei(val: BigNumber) {
    return parseFloat(formatUnits(val, 'wei'))
  }

  function toNumEther(val: BigNumber) {
    return parseFloat(formatUnits(val, 'ether'))
  }

  async function tuxAs(wallet: Wallet) {
    return tux.connect(wallet)
  }

  async function deploy() {
    [
      deployerWallet,
      creatorWallet,
      otherWallet,
      ownerWallet,
      prevOwnerWallet,
    ] = await ethers.getSigners()

    const Tux = await ethers.getContractFactory('contracts/Tux.sol:Tux')
    tux = await Tux.connect(deployerWallet).deploy('tux', 'TUX')
    await tux.deployed()
    tuxAddress = tux.address
  }

  async function mint(
    tux: any,
    newTokenURI: string
  ) {
    return await tux.mint(newTokenURI)
  }


  describe('#constructor', () => {
    it('should be able to deploy', async () => {
      await expect(deploy()).eventually.fulfilled
    })
  })


  describe('#mint', () => {
    beforeEach(async () => {
      await deploy()
    })

    it('should mint a token', async () => {
      const tux = await tuxAs(creatorWallet)

      await expect(
        mint(
          tux,
          tokenURI
        )
      ).fulfilled

      const t = await tux.tokenByIndex(0)
      const ownerT = await tux.tokenOfOwnerByIndex(creatorWallet.address, 0)
      const ownerOf = await tux.ownerOf(1)
      const creator = await tux.tokenCreators(1)
      const newTokenURI = await tux.tokenURI(1)

      expect(toNumWei(t)).eq(toNumWei(ownerT))
      expect(ownerOf).eq(creatorWallet.address)
      expect(creator).eq(creatorWallet.address)
      expect(newTokenURI).eq(`ipfs://${tokenURI}`)
    })

    // it('should revert if the content hash already exists for a created token', async () => {
    //   const tux = await tuxAs(creatorWallet)
    //
    //   await expect(
    //     mint(
    //       tux,
    //       tokenURI
    //     )
    //   ).fulfilled
    //
    //   await expect(
    //     mint(
    //       tux,
    //       tokenURI
    //     )
    //   ).rejectedWith(
    //     'Tux: tokenURI already exists'
    //   )
    // })

    it('should revert if the tokenURI is empty', async () => {
      const tux = await tuxAs(creatorWallet)

      await expect(
        mint(
          tux,
          ''
        )
      ).rejectedWith('Tux: empty tokenURI')
    })

    it('should list tokens created by a creator', async () => {
      const tux = await tuxAs(creatorWallet)

      await expect(
        mint(
          tux,
          tokenURI
        )
      ).fulfilled

      await expect(
        mint(
          tux,
          tokenURI2
        )
      ).fulfilled

      const creatorTokens = await tux.getCreatorTokens(creatorWallet.address)
      await expect(creatorTokens.length).eq(2)
    })

    it('should return the token creator', async () => {
      const tux = await tuxAs(creatorWallet)

      await expect(
        mint(
          tux,
          tokenURI
        )
      ).fulfilled

      const creatorTokens = await tux.getCreatorTokens(creatorWallet.address)
      await expect(creatorTokens.length).eq(1)

      const tokenCreator = await tux.tokenCreator(creatorTokens[0])
      await expect(tokenCreator).eq(creatorWallet.address)
    })
  })

  describe('#transfer', () => {
    beforeEach(async () => {
      await deploy()

      const tux = await tuxAs(creatorWallet)
      await expect(
        mint(
          tux,
          tokenURI
        )
      ).fulfilled
    })

    it('should be able to transfer a token', async () => {
      const tux = await tuxAs(creatorWallet)

      await expect(
        tux.transferFrom(
          creatorWallet.address,
          otherWallet.address,
          1
        )
      ).fulfilled
    })
  })

  describe('#burn', () => {
    beforeEach(async () => {
      await deploy()

      const tux = await tuxAs(creatorWallet)
      await mint(
        tux,
        tokenURI
      )
    })

    it('should allow the current owner', async () => {
      let tux = await tuxAs(creatorWallet)
      await tux.transferFrom(
        creatorWallet.address,
        ownerWallet.address,
        1
      )

      tux = await tuxAs(ownerWallet)
      await expect(tux.burn(1)).fulfilled
    })

    it('should allow if approved, but the owner is not the creator', async () => {
      let tux = await tuxAs(creatorWallet)
      await tux.transferFrom(
        creatorWallet.address,
        ownerWallet.address,
        1
      )

      tux = await tuxAs(ownerWallet)
      await tux.approve(otherWallet.address, 1)

      tux = await tuxAs(otherWallet)
      await expect(tux.burn(1)).fulfilled
    })

    it('should revert when the caller tries to approve, but is not the owner', async () => {
      let tux = await tuxAs(creatorWallet)
      await tux.transferFrom(
        creatorWallet.address,
        ownerWallet.address,
        1
      )

      tux = await tuxAs(otherWallet)
      await expect(tux.approve(otherWallet.address, 1)).rejectedWith(
        'ERC721: approve caller is not owner nor approved for all'
      )
    })

    it('should revert when the caller is not the owner or a creator', async () => {
      const tux = await tuxAs(otherWallet)

      await expect(tux.burn(1)).rejectedWith(
        'ERC721Burnable: caller is not owner nor approved'
      )
    })

    it('should revert if the token id does not exist', async () => {
      const tux = await tuxAs(creatorWallet)

      await expect(tux.burn(2)).rejectedWith(
        'ERC721: operator query for nonexistent token'
      )
    })

    it('should clear approvals, owner, previousOwner and tokenURI', async () => {
      const tux = await tuxAs(creatorWallet)

      await expect(tux.approve(otherWallet.address, 1)).fulfilled

      await expect(tux.burn(1)).fulfilled

      await expect(tux.ownerOf(1)).rejectedWith(
        'ERC721: owner query for nonexistent token'
      )

      await expect(tux.getApproved(1)).rejectedWith(
        'ERC721: approved query for nonexistent token'
      )

      await expect(tux.tokenURI(1)).rejectedWith(
        'ERC721URIStorage: URI query for nonexistent token'
      )

      const totalSupply = await tux.totalSupply()
      expect(toNumWei(totalSupply)).eq(0)
    })

    it('should clear approvals, owner and tokenURI when approved', async () => {
      const tux = await tuxAs(creatorWallet)

      await expect(tux.approve(otherWallet.address, 1)).fulfilled

      const othertux = await tuxAs(otherWallet)

      await expect(othertux.burn(1)).fulfilled

      await expect(tux.ownerOf(1)).rejectedWith(
        'ERC721: owner query for nonexistent token'
      )

      await expect(tux.getApproved(1)).rejectedWith(
        'ERC721: approved query for nonexistent token'
      )

      await expect(tux.tokenURI(1)).rejectedWith(
        'ERC721URIStorage: URI query for nonexistent token'
      )

      const totalSupply = await tux.totalSupply()
      expect(toNumWei(totalSupply)).eq(0)
    })
  })

  describe('#supportsInterface', async () => {
    beforeEach(async () => {
      await deploy()
    })

    it('should return true to supporting the ERC721 interface', async () => {
      const tux = await tuxAs(otherWallet)
      const interfaceId = ethers.utils.arrayify('0x80ac58cd')
      const supportsId = await tux.supportsInterface(interfaceId)
      expect(supportsId).eq(true)
    })

    it('should return true to supporting the metadata interface', async () => {
      const tux = await tuxAs(otherWallet)
      const interfaceId = ethers.utils.arrayify('0x5b5e139f')
      const supportsId = await tux.supportsInterface(interfaceId)
      expect(supportsId).eq(true)
    })

    it('should return false to supporting a random interface', async () => {
      const tux = await tuxAs(otherWallet)
      const interfaceId = ethers.utils.arrayify('0x5b4e139f')
      const supportsId = await tux.supportsInterface(interfaceId)
      expect(supportsId).eq(false)
    })
  })
})
