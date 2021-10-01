import { ethers } from 'hardhat'

import chai, { expect } from 'chai'
import asPromised from 'chai-as-promised'

import { arrayify } from 'ethers/lib/utils'
import { AddressZero } from '@ethersproject/constants'
import { Wallet, Contract, Signer, BigNumber } from 'ethers'

import { Auctions, BadBidder, TestERC721, BadERC721 } from "../typechain"

import {
  approveAuctions,
  deployTux,
  deployBidder,
  deployOtherNFTs,
  mint,
  revert,
  ONE_ETH,
  TWO_ETH,
  TOKEN_URI,
  TOKEN_URI_TWO
} from "./utils"

chai.use(asPromised)


describe("Auctions", () => {
  let tux: any
  let badERC721: BadERC721
  let testERC721: TestERC721

  beforeEach(async () => {
    // await ethers.provider.send("hardhat_reset", []);
    tux = await deployTux()
    const nfts = await deployOtherNFTs()
    badERC721 = nfts.bad
    testERC721 = nfts.test
  })

  async function deploy(): Promise<Auctions> {
    const Auctions = await ethers.getContractFactory('contracts/Auctions.sol:Auctions')
    const auctions = await Auctions.deploy()

    return auctions as Auctions
  }

  async function createHouse(
    auctions: Auctions,
    curator: string,
    fee: number = 500,
    preApproved: boolean = true,
    houseName: string = 'Nice house'
  ) {
    await auctions.createHouse(
      houseName,
      curator,
      fee,
      preApproved,
      TOKEN_URI_TWO // Metadata hash
    )
  }

  async function createAuction(
    auctions: Auctions,
    houseId: number = 0
  ) {
    const tokenId = 1
    const duration = 60 * 60 * 24
    const reservePrice = BigNumber.from(10).pow(18).div(2)

    await auctions.createAuction(
      tux.address,
      tokenId,
      duration,
      reservePrice,
      houseId
    )
  }


  describe("#constructor", () => {
    it("should be able to deploy", async () => {
      const Auctions = await ethers.getContractFactory('contracts/Auctions.sol:Auctions')
      const auctions = await Auctions.deploy()

      expect(await auctions.timeBuffer()).to.eq(
        900,
        "time buffer should equal 900"
      )
      expect(await auctions.minimumIncrementPercentage()).to.eq(
        500,
        "minBidIncrementPercentage should equal 5%"
      )
    })
  })


  describe("#createHouse", () => {
    let auctions: Auctions

    beforeEach(async () => {
      const [_, curator] = await ethers.getSigners()

      auctions = await deploy()
      await mint(tux)
      await approveAuctions(tux, auctions)
      await createHouse(auctions, await curator.getAddress())
    })

    it('should create a house', async () => {
      const [_, curator] = await ethers.getSigners()

      const house = await auctions.houses(1)

      expect(house.name).eq('Nice house')
      expect(house.curator).eq(await curator.getAddress())
      expect(house.fee).eq(500)
      expect(house.preApproved).eq(true)
      expect(house.metadata).eq(TOKEN_URI_TWO)
    })

    it('should create a house with a long name', async () => {
      const [_, curator] = await ethers.getSigners()

      const houseName = 'Longer house name'
      await createHouse(auctions, await curator.getAddress(), 100, false, houseName)
      const house = await auctions.houses(2)

      expect(house.name).eq(houseName)
      expect(house.curator).eq(await curator.getAddress())
      expect(house.fee).eq(100)
      expect(house.preApproved).eq(false)
      expect(house.metadata).eq(TOKEN_URI_TWO)
    })

    it('should revert creating a house with a name that is too long', async () => {
      const [_, curator] = await ethers.getSigners()

      const houseName = 'Longer house name that is a too long'
      await expect(
        createHouse(auctions, await curator.getAddress(), 100, true, houseName)
      ).eventually.rejectedWith(
        revert`House name must be less than 32 characters`
      )
    })

    it('should revert if the house name already exists', async () => {
      const [_, curator] = await ethers.getSigners()

      await expect(
        createHouse(auctions, await curator.getAddress())
      ).eventually.rejectedWith(
        revert`House name already exists`
      )
    })

    it('should revert if the curator fee percentage is >= 100%', async () => {
      const [_, curator] = await ethers.getSigners()
      await expect(
        createHouse(auctions, await curator.getAddress(), 10000, true, 'Other house')
      ).eventually.rejectedWith(
        revert`Curator fee percentage must be less than 100%`)
    })

    it('should add a creator', async () => {
      const [creator, curator] = await ethers.getSigners()

      await auctions.connect(curator).addCreator(1, await creator.getAddress())

      const creators = await auctions.getHouseCreators(1)

      expect(creators[0]).eq(await creator.getAddress())
    })

    it('should revert adding a creator if not the house curator', async () => {
      const [creator] = await ethers.getSigners()

      await expect(
        auctions.connect(creator).addCreator(1, await creator.getAddress())
      ).eventually.rejectedWith(
        revert`Must be house curator`
      )
    })

    it('should remove a creator', async () => {
      const [creator, curator] = await ethers.getSigners()

      await auctions.connect(curator).addCreator(1, await creator.getAddress())
      await auctions.connect(curator).removeCreator(1, await creator.getAddress())

      const creators = await auctions.getHouseCreators(1)

      expect(creators.length).eq(0)
    })

    it('should revert removing a creator if not the house curator', async () => {
      const [creator] = await ethers.getSigners()

      await expect(
        auctions.connect(creator).removeCreator(1, await creator.getAddress())
      ).eventually.rejectedWith(
        revert`Must be house curator`
      )
    })

    it('should update house fee', async () => {
      const [_, curator] = await ethers.getSigners()

      await auctions.connect(curator).updateFee(1, 100)

      const house = await auctions.houses(1)

      expect(house.fee).eq(100)
    })

    it('should revert updating the fee if not the house curator', async () => {
      const [creator] = await ethers.getSigners()

      await expect(
        auctions.connect(creator).updateFee(1, 0)
      ).eventually.rejectedWith(
        revert`Must be house curator`
      )
    })

    it('should revert if updating the curator fee percentage is >= 100%', async () => {
      const [_, curator] = await ethers.getSigners()
      await expect(
        auctions.connect(curator).updateFee(1, 10000)
      ).eventually.rejectedWith(
        revert`Curator fee percentage must be less than 100%`)
    })

    it('should update house metadata', async () => {
      const [_, curator] = await ethers.getSigners()

      await auctions.connect(curator).updateMetadata(1, TOKEN_URI)

      const house = await auctions.houses(1)

      expect(house.metadata).eq(TOKEN_URI)
    })

    it('should revert updating metadata if not the house curator', async () => {
      const [creator] = await ethers.getSigners()

      await expect(
        auctions.connect(creator).updateMetadata(1, TOKEN_URI)
      ).eventually.rejectedWith(
        revert`Must be house curator`
      )
    })

    it('should get auction IDs by house ID', async () => {
      const [creator, curator] = await ethers.getSigners()

      await auctions.connect(curator).addCreator(1, await creator.getAddress())
      await createAuction(auctions.connect(creator), 1)

      const auctionList = await auctions.getHouseAuctions(1)

      expect(auctionList.length).eq(1)
      expect(auctionList[0]).eq(1)
    })

    it('should get house IDs by curator', async () => {
      const [_, curator] = await ethers.getSigners()
      createHouse(auctions, await curator.getAddress(), 100, true, 'Other house')

      const houses = await auctions.getCuratorHouses(await curator.getAddress())

      expect(houses.length).eq(2)
      expect(houses[0]).eq(1)
      expect(houses[1]).eq(2)
    })

    it('should get house IDs by creator', async () => {
      const [creator, curator] = await ethers.getSigners()
      createHouse(auctions, await curator.getAddress(), 100, true, 'Other house')

      await auctions.connect(curator).addCreator(1, await creator.getAddress())
      await auctions.connect(curator).addCreator(2, await creator.getAddress())

      const houses = await auctions.getCreatorHouses(await creator.getAddress())

      expect(houses.length).eq(2)
      expect(houses[0]).eq(1)
      expect(houses[1]).eq(2)
    })

    it('should get house ID by name', async () => {
      const [_, curator] = await ethers.getSigners()

      const houseId = await auctions.houseIDs('Nice house')

      expect(houseId).eq(1)
    })
  })


  describe("#createAuction", () => {
    let auctions: Auctions

    beforeEach(async () => {
      const [_, curator] = await ethers.getSigners()
      auctions = await deploy()
      await mint(tux)
      await approveAuctions(tux, auctions)
      await createHouse(auctions, await curator.getAddress())
    })

    it("should revert if the token contract does not support the ERC721 interface", async () => {
      const duration = 60 * 60 * 24
      const reservePrice = BigNumber.from(10).pow(18).div(2)
      const [_, curator] = await ethers.getSigners()

      await expect(
        auctions.createAuction(
          badERC721.address,
          0,
          duration,
          reservePrice,
          0
        )
      ).eventually.rejectedWith(
        revert`Token contract does not support ERC721 interface`
      )
    })

    it("should revert if the caller is not approved", async () => {
      const duration = 60 * 60 * 24
      const reservePrice = BigNumber.from(10).pow(18).div(2)
      const [_, curator, __, ___, unapproved] = await ethers.getSigners()
      await expect(
        auctions
          .connect(unapproved)
          .createAuction(
            tux.address,
            1,
            duration,
            reservePrice,
            0
          )
      ).eventually.rejectedWith(
        revert`Must be token owner or approved`
      )
    })

    it("should revert if the token ID does not exist", async () => {
      const tokenId = 999
      const duration = 60 * 60 * 24
      const reservePrice = BigNumber.from(10).pow(18).div(2)
      const [owner, curator] = await ethers.getSigners()

      await expect(
        auctions
          .connect(owner)
          .createAuction(
            tux.address,
            tokenId,
            duration,
            reservePrice,
            0
          )
      ).eventually.rejectedWith(
        revert`ERC721: owner query for nonexistent token`)
    })

    it("should revert if not approved by a house", async () => {
      await expect(
        createAuction(auctions, 1)
      ).eventually.rejectedWith(
        revert`Must be approved by the house`)
    })

    it("should create an auction", async () => {
      const [owner] = await ethers.getSigners()
      await createAuction(auctions, 0)

      const createdAuction = await auctions.auctions(1)

      expect(createdAuction.tokenContract).to.eq(tux.address)
      expect(createdAuction.tokenOwner).to.eq(await owner.getAddress())
      expect(createdAuction.reservePrice).to.eq(BigNumber.from(10).pow(18).div(2))
      expect(createdAuction.duration).to.eq(24 * 60 * 60)
      expect(createdAuction.approved).to.eq(true)
      expect(createdAuction.fee).to.eq(0)
    })

    it("should be automatically approved if there is no curator", async () => {
      const owner = await tux.ownerOf(1)
      await createAuction(auctions, 0)

      const createdAuction = await auctions.auctions(1)

      expect(createdAuction.approved).to.eq(true)
    })

    it("should be automatically approved if the house preapproves", async () => {
      const owner = await tux.ownerOf(1)
      const [_, curator] = await ethers.getSigners()
      await auctions.connect(curator).addCreator(1, owner)
      await createAuction(auctions, 1)

      const createdAuction = await auctions.auctions(1)

      expect(createdAuction.duration).to.eq(24 * 60 * 60)
      expect(createdAuction.reservePrice).to.eq(
        BigNumber.from(10).pow(18).div(2)
      )
      expect(createdAuction.fee).to.eq(500)
      expect(createdAuction.tokenOwner).to.eq(owner)
      expect(createdAuction.approved).to.eq(true)
      // expect(createdAuction.curator).to.eq(curator.address)
    })

    // it("should be automatically approved if the creator is the Zero Address", async () => {
    //   await createAuction(auctions, 0) // ethers.constants.AddressZero)
    //
    //   const createdAuction = await auctions.auctions(0)
    //
    //   expect(createdAuction.approved).to.eq(true)
    // })

    it("should emit an AuctionCreated event", async () => {
      const owner = await tux.ownerOf(1)
      const [_, expectedCurator] = await ethers.getSigners()

      const block = await ethers.provider.getBlockNumber()
      await createAuction(auctions, 0) // await expectedCurator.getAddress())
      const currAuction = await auctions.auctions(1)
      const events = await auctions.queryFilter(
        auctions.filters.AuctionCreated(null),
        block
      )
      expect(events.length).eq(1)
      const logDescription = auctions.interface.parseLog(events[0])
      expect(logDescription.name).to.eq("AuctionCreated")
      expect(logDescription.args.auctionId).to.eq(1)
    })
  })

  describe("#setAuctionApproval", () => {
    let auctions: Auctions
    let admin: Signer
    let curator: Signer
    let bidder: Signer

    beforeEach(async () => {
      [admin, curator, bidder] = await ethers.getSigners()
      auctions = await deploy()
      await mint(tux)
      await approveAuctions(tux, auctions)
      await createHouse(auctions, await curator.getAddress(), 100, false)
      await auctions.connect(curator).addCreator(1, await admin.getAddress())
      await createAuction(
        auctions.connect(admin),
        1 // await curator.getAddress()
      )
    })

    it("should revert if the auction does not exist", async () => {
      await expect(
        auctions.setAuctionApproval(2, true)
      ).eventually.rejectedWith(revert`Auction does not exist`)
    })

    it("should revert if not called by the curator", async () => {
      await expect(
        auctions.connect(bidder).setAuctionApproval(1, true)
      ).eventually.rejectedWith(revert`Must be auction curator`)
    })

    it("should revert if the auction has already started", async () => {
      await auctions.connect(curator).setAuctionApproval(1, true)
      await auctions
        .connect(bidder)
        .createBid(1, ONE_ETH, { value: ONE_ETH })
      await expect(
        auctions.connect(curator).setAuctionApproval(1, false)
      ).eventually.rejectedWith(revert`Auction has already started`)
    })

    it("should set the auction as approved", async () => {
      await auctions.connect(curator).setAuctionApproval(1, true)

      expect((await auctions.auctions(1)).approved).to.eq(true)
    })

    it("should emit an AuctionApproved event", async () => {
      const block = await ethers.provider.getBlockNumber()
      await auctions.connect(curator).setAuctionApproval(1, true)
      const events = await auctions.queryFilter(
        auctions.filters.AuctionApprovalUpdated(null, null),
        block
      )
      expect(events.length).eq(1)
      const logDescription = auctions.interface.parseLog(events[0])

      expect(logDescription.args.approved).to.eq(true)
    })
  })

  describe("#setAuctionReservePrice", () => {
    let auctions: Auctions
    let admin: Signer
    let creator: Signer
    let curator: Signer
    let bidder: Signer

    beforeEach(async () => {
      [admin, creator, curator, bidder] = await ethers.getSigners()
      auctions = await deploy()
      await mint(tux.connect(creator))
      await approveAuctions(
        tux.connect(creator),
        auctions.connect(creator)
      )
      await createHouse(auctions, await curator.getAddress())
      await auctions.connect(curator).addCreator(1, await creator.getAddress())
      await createAuction(
        auctions.connect(creator),
        1 // await curator.getAddress()
      )
    })

    it("should revert if the auctions does not exist", async () => {
      await expect(
        auctions.connect(creator).setAuctionReservePrice(2, TWO_ETH)
      ).eventually.rejectedWith(revert`Auction does not exist`)
    })

    it("should revert if not called by the owner", async () => {
      await expect(
        auctions.connect(admin).setAuctionReservePrice(1, TWO_ETH)
      ).eventually.rejectedWith(revert`Must be token owner`)
    })

    it("should revert when called by the curator", async () => {
      await expect(
        auctions.connect(curator).setAuctionReservePrice(1, TWO_ETH)
      ).eventually.rejectedWith(revert`Must be token owner`)
    })

    it("should revert if the auction has already started", async () => {
      await auctions.connect(creator).setAuctionReservePrice(1, TWO_ETH)
      // await auctions.setAuctionApproval(1, true)
      await auctions
        .connect(bidder)
        .createBid(1, TWO_ETH, { value: TWO_ETH })
      await expect(
        auctions.connect(creator).setAuctionReservePrice(1, ONE_ETH)
      ).eventually.rejectedWith(revert`Auction has already started`)
    })

    it("should set the auction reserve price when called by the token owner", async () => {
      await auctions.connect(creator).setAuctionReservePrice(1, TWO_ETH)

      expect((await auctions.auctions(1)).reservePrice).to.eq(TWO_ETH)
    })

    it("should emit an AuctionReservePriceUpdated event", async () => {
      const block = await ethers.provider.getBlockNumber()
      await auctions.connect(creator).setAuctionReservePrice(1, TWO_ETH)
      const events = await auctions.queryFilter(
        auctions.filters.AuctionReservePriceUpdated(null, null),
        block
      )
      expect(events.length).eq(1)
      const logDescription = auctions.interface.parseLog(events[0])

      expect(logDescription.args.reservePrice).to.eq(TWO_ETH)
    })
  })

  describe("#createBid", () => {
    let auctions: Auctions
    let admin: Signer
    let curator: Signer
    let bidderA: Signer
    let bidderB: Signer

    beforeEach(async () => {
      [admin, curator, bidderA, bidderB] = await ethers.getSigners()
      auctions = await deploy()
      await mint(tux)
      await approveAuctions(tux, auctions)
      await createHouse(auctions, await curator.getAddress())
      await auctions.connect(curator).addCreator(1, await admin.getAddress())
      await createAuction(
        auctions.connect(admin),
        1 // await curator.getAddress()
      )
      // await auctions.connect(curator).setAuctionApproval(1, true)
    })

    it("should revert if the specified auction does not exist", async () => {
      await expect(
        auctions.createBid(11111, ONE_ETH)
      ).eventually.rejectedWith(revert`Auction does not exist`)
    })

    it("should revert if the specified auction is not approved", async () => {
      await auctions.connect(curator).setAuctionApproval(1, false)
      await expect(
        auctions.createBid(1, ONE_ETH, { value: ONE_ETH })
      ).eventually.rejectedWith(revert`Auction must be approved by curator`)
    })

    it("should revert if the bid is less than the reserve price", async () => {
      await expect(
        auctions.createBid(1, 0, { value: 0 })
      ).eventually.rejectedWith(revert`Bid below reserve price`)
    })

    it("should revert if msg.value does not equal specified amount", async () => {
      await expect(
        auctions.createBid(1, ONE_ETH, {
          value: ONE_ETH.mul(2),
        })
      ).eventually.rejectedWith(
        revert`Sent ETH does not match specified bid amount`
      )
    })

    describe("first bid", () => {
      it("should set the first bid time", async () => {
        // TODO: Fix this test on Sun Oct 04 2274
        await ethers.provider.send("evm_setNextBlockTimestamp", [9617249934])
        await auctions.createBid(1, ONE_ETH, {
          value: ONE_ETH,
        })
        expect((await auctions.auctions(1)).firstBidTime).to.eq(9617249934)
      })

      it("should store the transferred ETH", async () => {
        await auctions.createBid(1, ONE_ETH, {
          value: ONE_ETH,
        })
        expect(await ethers.provider.getBalance(auctions.address)).to.eq(ONE_ETH)
      })

      it("should not update the auction's duration", async () => {
        const beforeDuration = (await auctions.auctions(1)).duration
        await auctions.createBid(1, ONE_ETH, {
          value: ONE_ETH,
        })
        const afterDuration = (await auctions.auctions(1)).duration

        expect(beforeDuration).to.eq(afterDuration)
      })

      it("should not update the auction's duration if the initial duration is zero", async () => {
        await mint(tux)
        tux.approve(auctions.address, 2)

        const houseId = 1
        const tokenId = 2
        const duration = 0
        const reservePrice = BigNumber.from(10).pow(18).div(2)
        await auctions.createAuction(
          tux.address,
          tokenId,
          duration,
          reservePrice,
          1
        )

        await auctions.createBid(2, ONE_ETH, { value: ONE_ETH })
        const afterDuration = (await auctions.auctions(2)).duration

        expect(afterDuration).to.eq(duration)
      })

      it("should store the bidder's information", async () => {
        await auctions.connect(bidderA).createBid(1, ONE_ETH, {
          value: ONE_ETH,
        })
        const currAuction = await auctions.auctions(1)

        expect(currAuction.bidder).to.eq(await bidderA.getAddress())
        expect(currAuction.amount).to.eq(ONE_ETH)
      })

      it("should emit an AuctionBid event", async () => {
        const block = await ethers.provider.getBlockNumber()
        await auctions.connect(bidderA).createBid(1, ONE_ETH, {
          value: ONE_ETH,
        })
        const events = await auctions.queryFilter(
          auctions.filters.AuctionBid(
            null,
            null,
            null,
            null,
            null
          ),
          block
        )
        expect(events.length).eq(1)
        const logDescription = auctions.interface.parseLog(events[0])
        expect(logDescription.name).to.eq("AuctionBid")
        expect(logDescription.args.auctionId).to.eq(1)
        expect(logDescription.args.bidder).to.eq(await bidderA.getAddress())
        expect(logDescription.args.value).to.eq(ONE_ETH)
        expect(logDescription.args.firstBid).to.eq(true)
        expect(logDescription.args.extended).to.eq(false)
      })
    })

    describe("second bid", () => {
      beforeEach(async () => {
        auctions = auctions.connect(bidderB)
        await auctions
          .connect(bidderA)
          .createBid(1, ONE_ETH, { value: ONE_ETH })
      })

      it("should revert if the bid is smaller than the last bid + minBid", async () => {
        await expect(
          auctions.createBid(1, ONE_ETH.add(1), {
            value: ONE_ETH.add(1),
          })
        ).eventually.rejectedWith(
          revert`Must send more than last bid by 5%`
        )
      })

      it("should refund the previous bid", async () => {
        const beforeBalance = await ethers.provider.getBalance(
          await bidderA.getAddress()
        )
        const beforeBidAmount = (await auctions.auctions(1)).amount
        await auctions.createBid(1, TWO_ETH, {
          value: TWO_ETH,
        })
        const afterBalance = await ethers.provider.getBalance(
          await bidderA.getAddress()
        )

        expect(afterBalance).to.eq(beforeBalance.add(beforeBidAmount))
      })

      it("should not update the firstBidTime", async () => {
        const firstBidTime = (await auctions.auctions(1)).firstBidTime
        await auctions.createBid(1, TWO_ETH, {
          value: TWO_ETH,
        })

        expect((await auctions.auctions(1)).firstBidTime).to.eq(
          firstBidTime
        )
      })

      it("should transfer the bid to the contract and store the ETH", async () => {
        await auctions.createBid(1, TWO_ETH, {
          value: TWO_ETH,
        })

        expect(await ethers.provider.getBalance(auctions.address)).to.eq(TWO_ETH)
      })

      it("should update the stored bid information", async () => {
        await auctions.createBid(1, TWO_ETH, {
          value: TWO_ETH,
        })

        const currAuction = await auctions.auctions(1)

        expect(currAuction.amount).to.eq(TWO_ETH)
        expect(currAuction.bidder).to.eq(await bidderB.getAddress())
      })

      it("should not extend the duration of the bid if outside of the time buffer", async () => {
        const beforeDuration = (await auctions.auctions(1)).duration
        await auctions.createBid(1, TWO_ETH, {
          value: TWO_ETH,
        })
        const afterDuration = (await auctions.auctions(1)).duration

        expect(beforeDuration).to.eq(afterDuration)
      })

      it("should emit an AuctionBid event", async () => {
        const block = await ethers.provider.getBlockNumber()
        await auctions.createBid(1, TWO_ETH, {
          value: TWO_ETH,
        })
        const events = await auctions.queryFilter(
          auctions.filters.AuctionBid(
            null,
            null,
            null,
            null,
            null
          ),
          block
        )

        expect(events.length).eq(2)
        const logDescription = auctions.interface.parseLog(events[1])
        expect(logDescription.name).to.eq("AuctionBid")
        expect(logDescription.args.bidder).to.eq(await bidderB.getAddress())
        expect(logDescription.args.value).to.eq(TWO_ETH)
        expect(logDescription.args.firstBid).to.eq(false)
        expect(logDescription.args.extended).to.eq(false)
      })

      describe("last minute bid", () => {
        beforeEach(async () => {
          const currAuction = await auctions.auctions(1)
          await ethers.provider.send("evm_setNextBlockTimestamp", [
            currAuction.firstBidTime
              .add(currAuction.duration)
              .sub(1)
              .toNumber(),
          ])
        })

        it("should extend the duration of the bid if inside of the time buffer", async () => {
          const beforeDuration = (await auctions.auctions(1)).duration
          await auctions.createBid(1, TWO_ETH, {
            value: TWO_ETH,
          })

          const currAuction = await auctions.auctions(1)
          expect(currAuction.duration).to.eq(
            beforeDuration.add(await auctions.timeBuffer()).sub(1)
          )
        })

        it("should emit an AuctionBid event", async () => {
          const block = await ethers.provider.getBlockNumber()
          await auctions.createBid(1, TWO_ETH, {
            value: TWO_ETH,
          })
          const events = await auctions.queryFilter(
            auctions.filters.AuctionBid(
              null,
              null,
              null,
              null,
              null
            ),
            block
          )

          expect(events.length).eq(2)
          const logDescription = auctions.interface.parseLog(events[1])
          expect(logDescription.name).to.eq("AuctionBid")
          expect(logDescription.args.bidder).to.eq(await bidderB.getAddress())
          expect(logDescription.args.value).to.eq(TWO_ETH)
          expect(logDescription.args.firstBid).to.eq(false)
          expect(logDescription.args.extended).to.eq(true)
        })
      })

      describe("late bid", () => {
        beforeEach(async () => {
          const currAuction = await auctions.auctions(1)
          await ethers.provider.send("evm_setNextBlockTimestamp", [
            currAuction.firstBidTime
              .add(currAuction.duration)
              .add(1)
              .toNumber(),
          ])
        })

        it("should revert if the bid is placed after expiry", async () => {
          await expect(
            auctions.createBid(1, TWO_ETH, {
              value: TWO_ETH,
            })
          ).eventually.rejectedWith(revert`Auction expired`)
        })
      })
    })
  })

  describe("#cancelAuction", () => {
    let auctions: Auctions
    let admin: Signer
    let creator: Signer
    let curator: Signer
    let bidder: Signer

    beforeEach(async () => {
      [admin, creator, curator, bidder] = await ethers.getSigners()
      auctions = await deploy()
      await mint(tux.connect(creator))
      await approveAuctions(tux.connect(creator), auctions)
      await createHouse(auctions, await curator.getAddress())
      await auctions.connect(curator).addCreator(1, await creator.getAddress())
      await createAuction(
        auctions.connect(creator),
        1 // await curator.getAddress()
      )
      // await auctions.connect(curator).setAuctionApproval(1, true)
    })

    it("should revert if the auction does not exist", async () => {
      await expect(auctions.cancelAuction(2)).eventually.rejectedWith(
        revert`Auction does not exist`
      )
    })

    it("should revert if not called by creator", async () => {
      await expect(
        auctions.connect(bidder).cancelAuction(1)
      ).eventually.rejectedWith(
        `Can only be called by auction creator`
      )
    })

    it("should revert if called by curator", async () => {
      await expect(
        auctions.connect(curator).cancelAuction(1)
      ).eventually.rejectedWith(
        `Can only be called by auction creator`
      )
    })

    it("should revert if the auction has already begun", async () => {
      await auctions
        .connect(bidder)
        .createBid(1, ONE_ETH, { value: ONE_ETH })
      await expect(
        auctions.connect(creator).cancelAuction(1)
      ).eventually.rejectedWith(
        revert`Cannot cancel an auction once it has begun`
      )
    })

    it("should be callable by the creator", async () => {
      await expect(auctions.connect(creator).cancelAuction(1)).fulfilled

      // const auctionResult = await auctions.auctions(1)

      // expect(auctionResult.amount.toNumber()).to.eq(0)
      // expect(auctionResult.duration.toNumber()).to.eq(0)
      // expect(auctionResult.firstBidTime.toNumber()).to.eq(0)
      // expect(auctionResult.reservePrice.toNumber()).to.eq(0)
      // expect(auctionResult.fee).to.eq(0)
      // expect(auctionResult.tokenOwner).to.eq(ethers.constants.AddressZero)
      // expect(auctionResult.bidder).to.eq(ethers.constants.AddressZero)
      // expect(auctionResult.houseId).to.eq(0)

      expect(await tux.ownerOf(1)).to.eq(await creator.getAddress())
    })

    it("should emit an AuctionCanceled event", async () => {
      const block = await ethers.provider.getBlockNumber()
      await auctions.connect(creator).cancelAuction(1)
      const events = await auctions.queryFilter(
        auctions.filters.AuctionCanceled(null),
        block
      )
      expect(events.length).eq(1)
      const logDescription = auctions.interface.parseLog(events[0])

      expect(logDescription.args.auctionId).to.eq(1)
    })
  })

  describe("#endAuction", () => {
    let auctions: Auctions
    let admin: Signer
    let creator: Signer
    let curator: Signer
    let bidder: Signer
    let other: Signer
    let badBidder: BadBidder

    beforeEach(async () => {
      [admin, creator, curator, bidder, other] = await ethers.getSigners()
      auctions = await deploy()
      await mint(tux.connect(creator))
      await approveAuctions(tux.connect(creator), auctions)
      await createHouse(auctions, await curator.getAddress())
      await auctions.connect(curator).addCreator(1, await creator.getAddress())
      await createAuction(
        auctions.connect(creator),
        1 // await curator.getAddress()
      )
      // await auctions.connect(curator).setAuctionApproval(1, true)
      badBidder = await deployBidder(auctions.address, tux.address)
    })

    it("should revert if the auction does not exist", async () => {
      await expect(auctions.endAuction(2)).eventually.rejectedWith(
        revert`Auction does not exist`
      )
    })

    it("should revert if the auction has not begun", async () => {
      await expect(auctions.endAuction(1)).eventually.rejectedWith(
        revert`Auction not started`
      )
    })

    it("should revert if the auction has not completed", async () => {
      await auctions.createBid(1, ONE_ETH, {
        value: ONE_ETH,
      })

      await expect(auctions.endAuction(1)).eventually.rejectedWith(
        revert`Auction not completed`
      )
    })

    it("should cancel the auction if the winning bidder is unable to receive NFTs", async () => {
      await badBidder.placeBid(1, TWO_ETH, { value: TWO_ETH })
      const endTime =
        (await auctions.auctions(1)).duration.toNumber() +
        (await auctions.auctions(1)).firstBidTime.toNumber()
      await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1])

      await auctions.endAuction(1)

      expect(await tux.ownerOf(1)).to.eq(await creator.getAddress())
      expect(await ethers.provider.getBalance(badBidder.address)).to.eq(
        TWO_ETH
      )
    })

    describe("ETH auction", () => {
      beforeEach(async () => {
        await auctions
          .connect(bidder)
          .createBid(1, ONE_ETH, { value: ONE_ETH })
        const endTime =
          (await auctions.auctions(1)).duration.toNumber() +
          (await auctions.auctions(1)).firstBidTime.toNumber()
        await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1])
      })

      it("should transfer the NFT to the winning bidder", async () => {
        await auctions.endAuction(1)

        expect(await tux.ownerOf(1)).to.eq(await bidder.getAddress())
      })

      it("should pay the curator their curatorFee percentage", async () => {
        const beforeBalance = await ethers.provider.getBalance(
          await curator.getAddress()
        )
        await auctions.endAuction(1)
        const expectedCuratorFee = "50000000000000000"
        const curatorBalance = await ethers.provider.getBalance(
          await curator.getAddress()
        )
        await expect(curatorBalance.sub(beforeBalance).toString()).to.eq(
          expectedCuratorFee
        )
      })

      it("should pay the creator the remainder of the winning bid", async () => {
        const beforeBalance = await ethers.provider.getBalance(
          await creator.getAddress()
        )
        await auctions.endAuction(1)
        const expectedProfit = "950000000000000000"
        const creatorBalance = await ethers.provider.getBalance(
          await creator.getAddress()
        )
        await expect(
          creatorBalance.sub(beforeBalance).toString()
        ).to.eq(expectedProfit)
      })

      it("should emit an AuctionEnded event", async () => {
        const block = await ethers.provider.getBlockNumber()
        const auctionData = await auctions.auctions(1)
        await auctions.endAuction(1)
        const events = await auctions.queryFilter(
          auctions.filters.AuctionEnded(null),
          block
        )
        expect(events.length).eq(1)
        const logDescription = auctions.interface.parseLog(events[0])

        expect(logDescription.args.auctionId).to.eq(1)
      })

      it("should delete the auction", async () => {
        await expect(auctions.endAuction(1)).fulfilled

        // const auctionResult = await auctions.auctions(1)
        //
        // expect(auctionResult.amount.toNumber()).to.eq(0)
        // expect(auctionResult.duration.toNumber()).to.eq(0)
        // expect(auctionResult.firstBidTime.toNumber()).to.eq(0)
        // expect(auctionResult.reservePrice.toNumber()).to.eq(0)
        // expect(auctionResult.fee).to.eq(0)
        // expect(auctionResult.tokenOwner).to.eq(ethers.constants.AddressZero)
        // expect(auctionResult.bidder).to.eq(ethers.constants.AddressZero)
        // expect(auctionResult.houseId).to.eq(1)
      })
    })
  })
})
