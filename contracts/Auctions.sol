// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.9;

import { ITux } from "./ITux.sol";
import { IAuctions } from "./IAuctions.sol";

import "./library/UintSet.sol";
import "./library/AddressSet.sol";
import "./library/OrderedSet.sol";
import "./library/RankedSet.sol";
import "./library/RankedAddressSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { IERC721, IERC165 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { IERC721Metadata } from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";


contract Auctions is
    IAuctions,
    ReentrancyGuard
{
    using SafeMath for uint256;
    using UintSet for UintSet.Set;
    using RankedSet for RankedSet.Set;
    using RankedAddressSet for RankedAddressSet.Set;
    using AddressSet for AddressSet.Set;
    using OrderedSet for OrderedSet.Set;
    using Counters for Counters.Counter;

    Counters.Counter private _bidIdTracker;
    Counters.Counter private _offerIdTracker;
    Counters.Counter private _houseIdTracker;
    Counters.Counter private _auctionIdTracker;

    // Minimum amount of time left in seconds to an auction after a new bid is placed
    uint256 constant public timeBuffer = 900;  // 15 minutes -> 900 seconds

    // Minimum percentage difference between the last bid and the current bid
    uint16 constant public minimumIncrementPercentage = 500;  // 5%

    // Mapping from house name to house ID
    mapping(string => uint256) public houseIDs;

    // Mapping from keccak256(contract, token) to currently running auction ID
    mapping(bytes32 => uint256) public tokenAuction;

    // Mapping of token contracts
    mapping(address => IAuctions.TokenContract) public contracts;

    // Mapping of auctions
    mapping(uint256 => IAuctions.Auction) public auctions;

    // Mapping of houses
    mapping(uint256 => IAuctions.House) public houses;

    // Mapping of bids
    mapping(uint256 => IAuctions.Bid) public bids;

    // Mapping of offers
    mapping(uint256 => IAuctions.Offer) public offers;

    // Mapping of accounts
    mapping(address => IAuctions.Account) public accounts;

    // Mapping from creator to stats
    mapping(address => IAuctions.CreatorStats) public creatorStats;

    // Mapping from collector to stats
    mapping(address => IAuctions.CollectorStats) public collectorStats;

    // Mapping from house ID to token IDs requiring approval
    mapping(uint256 => UintSet.Set) private _houseQueue;

    // Mapping from auction ID to bids
    mapping(uint256 => UintSet.Set) private _auctionBids;

    // Mapping from house ID to active auction IDs
    mapping(uint256 => OrderedSet.Set) private _houseAuctions;

    // Mapping from curator to enumerable house IDs
    mapping(address => UintSet.Set) private _curatorHouses;

    // Mapping from creator to enumerable house IDs
    mapping(address => UintSet.Set) private _creatorHouses;

    // Mapping from house id to enumerable creators
    mapping(uint256 => AddressSet.Set) private _houseCreators;

    // Mapping from seller to active auction IDs
    mapping(address => UintSet.Set) private _sellerAuctions;

    // Mapping from bidder to active auction IDs
    mapping(address => UintSet.Set) private _bidderAuctions;

    // Mapping from keccak256(contract, token) to previous auction IDs
    mapping(bytes32 => UintSet.Set) private _previousTokenAuctions;

    // Mapping from keccak256(contract, token) to offer IDs
    mapping(bytes32 => UintSet.Set) private _tokenOffers;

    // RankedSet of house IDs
    RankedSet.Set private _rankedHouses;

    // RankedAddressSet of creators
    RankedAddressSet.Set private _rankedCreators;

    // RankedAddressSet of collectors
    RankedAddressSet.Set private _rankedCollectors;

    // OrderedSet of active token contracts
    RankedAddressSet.Set private _rankedContracts;

    // OrderedSet of active houses
    OrderedSet.Set private _activeHouses;

    // OrderedSet of active auction IDs without a house ID
    OrderedSet.Set private _activeAuctions;


    bytes4 constant interfaceId = 0x80ac58cd; // ERC721 interfaceId
    bytes4 constant interfaceIdMetadata = 0x5b5e139f; // Metadata extension
    bytes4 constant interfaceIdEnumerable = 0x780e9d63; // Enumerable extension


    modifier auctionExists(uint256 auctionId) {
        require(
            auctions[auctionId].tokenOwner != address(0),
            "Auction does not exist");
        _;
    }

    modifier onlyHouseCurator(uint256 houseId) {
        require(
            msg.sender == houses[houseId].curator,
            "Must be house curator");
        _;
    }


    /*
     * Constructor
     */
    /* constructor() {} */

    function totalHouses() public view override returns (uint256) {
        return _houseIdTracker.current();
    }

    function totalAuctions() public view override returns (uint256) {
        return _auctionIdTracker.current();
    }

    function totalContracts() public view override returns (uint256) {
        return _rankedContracts.length();
    }

    function totalCreators() public view override returns (uint256) {
        return _rankedCreators.length();
    }

    function totalCollectors() public view override returns (uint256) {
        return _rankedCollectors.length();
    }

    function totalActiveHouses() public view override returns (uint256) {
        return _activeHouses.length();
    }

    function totalActiveAuctions() public view override returns (uint256) {
        return _activeAuctions.length();
    }

    function totalActiveHouseAuctions(uint256 houseId) public view override returns (uint256) {
        return _houseAuctions[houseId].length();
    }

    function getActiveHouses(uint256 from, uint256 n) public view override returns (uint256[] memory) {
        return _activeHouses.valuesFromN(from, n);
    }

    function getRankedHouses(uint256 from, uint256 n) public view override returns (uint256[] memory) {
        return _rankedHouses.valuesFromN(from, n);
    }

    function getRankedCreators(address from, uint256 n) public view override returns (address[] memory) {
        return _rankedCreators.valuesFromN(from, n);
    }

    function getRankedCollectors(address from, uint256 n) public view override returns (address[] memory) {
        return _rankedCollectors.valuesFromN(from, n);
    }

    function getRankedContracts(address from, uint256 n) public view override returns (address[] memory) {
        return _rankedContracts.valuesFromN(from, n);
    }

    function getAuctions() public view override returns (uint256[] memory) {
        return _activeAuctions.values();
    }

    function getAuctionsFromN(uint256 from, uint256 n) public view override returns (uint256[] memory) {
        return _activeAuctions.valuesFromN(from, n);
    }

    function getHouseAuctions(uint256 houseId) public view override returns (uint256[] memory) {
        return _houseAuctions[houseId].values();
    }

    function getHouseAuctionsFromN(uint256 houseId, uint256 from, uint256 n) public view override returns (uint256[] memory) {
        return _houseAuctions[houseId].valuesFromN(from, n);
    }

    function getHouseQueue(uint256 houseId) public view override returns (uint256[] memory) {
        return _houseQueue[houseId].values();
    }

    function getAuctionBids(uint256 auctionId) public view override returns (uint256[] memory) {
        return _auctionBids[auctionId].values();
    }

    function getCuratorHouses(address curator) public view override returns (uint256[] memory) {
        return _curatorHouses[curator].values();
    }

    function getCreatorHouses(address creator) public view override returns (uint256[] memory) {
        return _creatorHouses[creator].values();
    }

    function getHouseCreators(uint256 houseId) public view override returns (address[] memory) {
        return _houseCreators[houseId].values();
    }

    function getSellerAuctions(address seller) public view override returns (uint256[] memory) {
        return _sellerAuctions[seller].values();
    }

    function getBidderAuctions(address bidder) public view override returns (uint256[] memory) {
        return _bidderAuctions[bidder].values();
    }

    function getPreviousAuctions(bytes32 tokenHash) public view override returns (uint256[] memory) {
        return _previousTokenAuctions[tokenHash].values();
    }

    function getTokenOffers(bytes32 tokenHash) public view override returns (uint256[] memory) {
        return _tokenOffers[tokenHash].values();
    }


    function createHouse(
        string  memory name,
        address curator,
        uint16  fee,
        bool    preApproved,
        string  memory metadata
    )
        public
        override
        nonReentrant
        returns (uint256)
    {
        require(
            houseIDs[name] == 0,
            "House name already exists");
        require(
            bytes(name).length > 0,
            "House name is required");
        require(
            bytes(name).length <= 32,
            "House name must be less than 32 characters");
        require(
            curator != address(0),
            "Curator address is required");
        require(
            fee < 10000,
            "Curator fee percentage must be less than 100%");

        _houseIdTracker.increment();
        uint256 houseId = _houseIdTracker.current();

        houses[houseId].name = name;
        houses[houseId].curator = payable(curator);
        houses[houseId].fee = fee;
        houses[houseId].preApproved = preApproved;
        houses[houseId].metadata = metadata;

        _curatorHouses[curator].add(houseId);
        _rankedHouses.add(houseId);
        houseIDs[name] = houseId;

        emit HouseCreated(
            houseId
        );

        return houseId;
    }

    function addCreator(
        uint256 houseId,
        address creator
    )
        public
        override
        onlyHouseCurator(houseId)
    {
        require(
            _houseCreators[houseId].contains(creator) == false,
            "Creator already added");

        _houseCreators[houseId].add(creator);
        _creatorHouses[creator].add(houseId);

        emit CreatorAdded(
            houseId,
            creator
        );
    }

    function removeCreator(
        uint256 houseId,
        address creator
    )
        public
        override
        onlyHouseCurator(houseId)
    {
        require(
            _houseCreators[houseId].contains(creator) == true,
            "Creator already removed");

        _houseCreators[houseId].remove(creator);
        _creatorHouses[creator].remove(houseId);

        emit CreatorRemoved(
            houseId,
            creator
        );
    }

    function updateFee(
        uint256 houseId,
        uint16  fee
    )
        public
        override
        onlyHouseCurator(houseId)
    {
        require(
            fee < 10000,
            "Curator fee percentage must be less than 100%");

        houses[houseId].fee = fee;

        emit FeeUpdated(
            houseId,
            fee
        );
    }

    function updateMetadata(
        uint256 houseId,
        string memory metadata
    )
        public
        override
        onlyHouseCurator(houseId)
    {
        houses[houseId].metadata = metadata;

        emit MetadataUpdated(
            houseId,
            metadata
        );
    }

    function updateName(
        string  memory name
    )
        public
        override
    {
        accounts[msg.sender].name = name;

        emit AccountUpdated(
            msg.sender
        );
    }

    function updateBio(
        string  memory bioHash
    )
        public
        override
    {
        accounts[msg.sender].bioHash = bioHash;

        emit AccountUpdated(
            msg.sender
        );
    }

    function updatePicture(
        string  memory pictureHash
    )
        public
        override
    {
        accounts[msg.sender].pictureHash = pictureHash;

        emit AccountUpdated(
            msg.sender
        );
    }

    function createAuction(
        address tokenContract,
        uint256 tokenId,
        uint256 duration,
        uint256 reservePrice,
        uint256 houseId
    )
        public
        override
        nonReentrant
        returns (uint256)
    {
        if (contracts[tokenContract].tokenContract == address(0)) {
            registerTokenContract(tokenContract);
        }

        address tokenOwner = IERC721(tokenContract).ownerOf(tokenId);
        require(
            msg.sender == tokenOwner ||
            msg.sender == IERC721(tokenContract).getApproved(tokenId),
            "Must be token owner or approved");

        uint16  fee = 0;
        bool    preApproved = true;
        address curator = address(0);

        if (houseId > 0) {
            curator = houses[houseId].curator;

            require(
                curator != address(0),
                "House does not exist");
            require(
                _houseCreators[houseId].contains(tokenOwner) || msg.sender == curator,
                "Must be approved by the house");

            fee = houses[houseId].fee;
            preApproved = houses[houseId].preApproved;
            houses[houseId].activeAuctions += 1;
        }

        try ITux(tokenContract).tokenCreator(tokenId) returns (address creator) {
            if (!_rankedCreators.contains(creator)) {
                _rankedCreators.add(creator);
            }
        } catch {}

        _auctionIdTracker.increment();
        uint256 auctionId = _auctionIdTracker.current();

        tokenAuction[keccak256(abi.encode(tokenContract, tokenId))] = auctionId;

        _sellerAuctions[tokenOwner].add(auctionId);

        bool approved = (curator == address(0) || preApproved || curator == tokenOwner);

        if (houseId > 0) {
            if (approved == true) {
                _houseAuctions[houseId].add(auctionId);
                if (_activeHouses.head() != houseId) {
                    if (_activeHouses.contains(houseId)) {
                        _activeHouses.remove(houseId);
                    }
                    _activeHouses.add(houseId);
                }
            }
            else {
                _houseQueue[houseId].add(auctionId);
            }
        }
        else {
            _activeAuctions.add(auctionId);
        }

        auctions[auctionId] = Auction({
            tokenContract: tokenContract,
            tokenId: tokenId,
            tokenOwner: tokenOwner,
            duration: duration,
            reservePrice: reservePrice,
            houseId: houseId,
            fee: fee,
            approved: approved,
            firstBidTime: 0,
            amount: 0,
            bidder: payable(0),
            created: block.timestamp
        });

        IERC721(tokenContract).transferFrom(tokenOwner, address(this), tokenId);

        emit AuctionCreated(
            auctionId
        );

        return auctionId;
    }

    function setAuctionApproval(uint256 auctionId, bool approved)
        public
        override
        auctionExists(auctionId)
    {
        IAuctions.Auction storage auction = auctions[auctionId];
        address curator = houses[auction.houseId].curator;

        require(
            curator != address(0) && curator == msg.sender,
            "Must be auction curator");
        require(
            auction.firstBidTime == 0,
            "Auction has already started");
        require(
            (approved == true && auction.approved == false) ||
            (approved == false && auction.approved == true),
            "Auction already in this approved state");

        auction.approved = approved;

        if (approved == true) {
            _houseAuctions[auction.houseId].add(auctionId);
            _houseQueue[auction.houseId].remove(auctionId);

            if (_activeHouses.head() != auction.houseId) {
                if (_activeHouses.contains(auction.houseId)) {
                    _activeHouses.remove(auction.houseId);
                }
                _activeHouses.add(auction.houseId);
            }
        }

        emit AuctionApprovalUpdated(
            auctionId,
            approved
        );
    }

    function setAuctionReservePrice(uint256 auctionId, uint256 reservePrice)
        public
        override
        auctionExists(auctionId)
    {
        IAuctions.Auction storage auction = auctions[auctionId];

        require(
            msg.sender == auction.tokenOwner,
            "Must be token owner");
        require(
            auction.firstBidTime == 0,
            "Auction has already started");

        auction.reservePrice = reservePrice;

        emit AuctionReservePriceUpdated(
            auctionId,
            reservePrice
        );
    }

    function createBid(uint256 auctionId)
        public
        payable
        override
        nonReentrant
        auctionExists(auctionId)
    {
        IAuctions.Auction storage auction = auctions[auctionId];

        require(
            auction.approved,
            "Auction must be approved by curator");
        require(
            auction.firstBidTime == 0 ||
            block.timestamp < auction.firstBidTime.add(auction.duration),
            "Auction expired");
        require(
            msg.value >= auction.amount.add(
                auction.amount.mul(minimumIncrementPercentage).div(10000)),
            "Must send more than last bid by 5%");
        require(
            msg.value >= auction.reservePrice,
            "Bid below reserve price");

        address payable lastBidder = auction.bidder;
        bool isFirstBid = true;
        if (lastBidder != payable(0)) {
            isFirstBid = false;
        }

        if (auction.firstBidTime == 0) {
            auction.firstBidTime = block.timestamp;
        } else if (isFirstBid == false) {
            _handleOutgoingBid(lastBidder, auction.amount);
        }

        auction.amount = msg.value;
        auction.bidder = payable(msg.sender);

        if (auction.duration > 0) {
            _bidIdTracker.increment();
            uint256 bidId = _bidIdTracker.current();

            bids[bidId] = Bid({
                timestamp: block.timestamp,
                bidder: msg.sender,
                value: msg.value
            });

            _auctionBids[auctionId].add(bidId);
            _bidderAuctions[msg.sender].add(auctionId);
        }

        contracts[auction.tokenContract].bids += 1;

        try ITux(auction.tokenContract).tokenCreator(auction.tokenId) returns (address creator) {
            if (creator == auction.tokenOwner) {
                creatorStats[auction.tokenOwner].bids += 1;
            }
        } catch {}

        if (collectorStats[msg.sender].bids == 0) {
            _rankedCollectors.add(msg.sender);
        }
        collectorStats[msg.sender].bids += 1;

        if (auction.houseId > 0) {
            /* uint256 _bids = houses[auction.houseId].bids; // This gets too expensive... */
            houses[auction.houseId].bids += 1;
            /* _rankedHouses.rankScore(auction.houseId, _bids, houses[auction.houseId].bids); */

            _houseAuctions[auction.houseId].remove(auctionId);
            _houseAuctions[auction.houseId].add(auctionId);
        }

        bool extended = false;
        if (auction.duration > 0) {
          uint256 timeRemaining = auction.firstBidTime.add(auction.duration).sub(block.timestamp);
          if (timeRemaining < timeBuffer) {
              auction.duration += timeBuffer.sub(timeRemaining);
              extended = true;
          }
        }

        emit AuctionBid(
            auctionId,
            msg.sender,
            msg.value,
            isFirstBid,
            extended
        );

        if (extended) {
            emit AuctionDurationExtended(
                auctionId,
                auction.duration
            );
        }
    }

    function endAuction(uint256 auctionId)
        public
        override
        nonReentrant
        auctionExists(auctionId)
    {
        IAuctions.Auction storage auction = auctions[auctionId];

        require(
            uint256(auction.firstBidTime) != 0,
            "Auction not started");
        require(
            block.timestamp >=
            auction.firstBidTime.add(auction.duration),
            "Auction not completed");

        try IERC721(auction.tokenContract).safeTransferFrom(
            address(this), auction.bidder, auction.tokenId
        ) {} catch {
            _handleOutgoingBid(auction.bidder, auction.amount);
            _cancelAuction(auctionId);
            return;
        }

        uint256 houseId = auction.houseId;
        address curator = address(0);
        uint256 curatorFee = 0;
        uint256 tokenOwnerProfit = auction.amount;

        collectorStats[auction.bidder].bought += 1;
        collectorStats[auction.bidder].totalSpent += tokenOwnerProfit;
        contracts[auction.tokenContract].sales += 1;
        contracts[auction.tokenContract].total += tokenOwnerProfit;

        try ITux(auction.tokenContract).tokenCreator(auction.tokenId) returns (address creator) {
            if (creator == auction.tokenOwner) {
                creatorStats[creator].sales += 1;
                creatorStats[creator].total += tokenOwnerProfit;
            } else {
                collectorStats[auction.tokenOwner].sales += 1;
                collectorStats[auction.tokenOwner].totalSold += tokenOwnerProfit;
            }
        } catch {
            collectorStats[auction.tokenOwner].sales += 1;
            collectorStats[auction.tokenOwner].totalSold += tokenOwnerProfit;
        }

        if (houseId > 0) {
            curator = houses[houseId].curator;
            houses[houseId].sales += 1;
            houses[houseId].total += tokenOwnerProfit;
            if (houses[houseId].activeAuctions > 0) {
                houses[houseId].activeAuctions -= 1;
            }
            _houseAuctions[houseId].remove(auctionId);
        }
        else {
            _activeAuctions.remove(auctionId);
        }

        if (curator != address(0)) {
            curatorFee = tokenOwnerProfit.mul(auction.fee).div(10000);
            tokenOwnerProfit = tokenOwnerProfit.sub(curatorFee);
            _handleOutgoingBid(curator, curatorFee);
        }
        _handleOutgoingBid(auction.tokenOwner, tokenOwnerProfit);

        if (houseId > 0) {
            houses[houseId].feesTotal += curatorFee;
        }

        bytes32 auctionHash = keccak256(abi.encode(auction.tokenContract, auction.tokenId));
        _previousTokenAuctions[auctionHash].add(auctionId);
        delete tokenAuction[auctionHash];

        if (auction.duration > 0) {
            uint256 i = _auctionBids[auctionId].length();
            while (i > 0) {
                uint256 bidId = _auctionBids[auctionId].at(i - 1);
                _bidderAuctions[bids[bidId].bidder].remove(auctionId);
                i--;
            }
        }

        _sellerAuctions[auction.tokenOwner].remove(auctionId);

        emit AuctionEnded(
            auctionId
        );
    }

    function buyAuction(uint256 auctionId)
        public
        payable
        override
    {
        createBid(auctionId);
        endAuction(auctionId);
    }

    function cancelAuction(uint256 auctionId)
        public
        override
        nonReentrant
        auctionExists(auctionId)
    {
        require(
            auctions[auctionId].tokenOwner == msg.sender,
            "Can only be called by auction creator");
        require(
            uint256(auctions[auctionId].firstBidTime) == 0,
            "Cannot cancel an auction once it has begun");

        _cancelAuction(auctionId);
    }

    function registerTokenContract(address tokenContract)
        public
        override
    {
        require(
            contracts[tokenContract].tokenContract == address(0),
            "Token contract already registered");
        require(
            IERC165(tokenContract).supportsInterface(interfaceId),
            "Token contract does not support the ERC721 interface");
        require(
            IERC165(tokenContract).supportsInterface(interfaceIdMetadata),
            "Token contract does not support the ERC721 Metadata extension");
        require(
            IERC165(tokenContract).supportsInterface(interfaceIdEnumerable),
            "Token contract does not support the ERC721 Enumerable extension");

        contracts[tokenContract].name = IERC721Metadata(tokenContract).name();
        contracts[tokenContract].tokenContract = tokenContract;

        _rankedContracts.add(tokenContract);
    }

    function makeOffer(address tokenContract, uint256 tokenId)
        public
        override
        payable
        nonReentrant
    {
        require(
            IERC165(tokenContract).supportsInterface(interfaceId),
            "Token contract does not support the ERC721 interface");

        bytes32 auctionHash = keccak256(abi.encode(tokenContract, tokenId));
        require(
            tokenAuction[auctionHash] == 0,
            'Auction exists for this token');

        _offerIdTracker.increment();
        uint256 offerId = _offerIdTracker.current();

        offers[offerId] = Offer({
            tokenContract: tokenContract,
            tokenId: tokenId,
            from: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        });

        _tokenOffers[auctionHash].add(offerId);
    }

    function acceptOffer(uint256 offerId)
        public
        override
    {
        IAuctions.Offer storage offer = offers[offerId];
        require(
            offer.tokenContract != address(0),
            'Offer does not exist');

        address tokenOwner = IERC721(offer.tokenContract).ownerOf(offer.tokenId);
        require(
            msg.sender == tokenOwner ||
            msg.sender == IERC721(offer.tokenContract).getApproved(offer.tokenId),
            "Must be token owner or approved");

        IERC721(offer.tokenContract).safeTransferFrom(msg.sender, offer.from, offer.tokenId);

        _handleOutgoingBid(msg.sender, offer.amount);

        bytes32 auctionHash = keccak256(abi.encode(offer.tokenContract, offer.tokenId));
        _tokenOffers[auctionHash].remove(offerId);

        delete offers[offerId];
    }

    function cancelOffer(uint256 offerId)
        public
        override
    {
        IAuctions.Offer storage offer = offers[offerId];
        require(
            offer.from == msg.sender,
            'Not offer owner or does not exist');

        _handleOutgoingBid(msg.sender, offer.amount);

        bytes32 auctionHash = keccak256(abi.encode(offer.tokenContract, offer.tokenId));
        _tokenOffers[auctionHash].remove(offerId);

        delete offers[offerId];
    }

    function updateHouseRank(uint256 houseId)
        public
        override
    {
        require(
            houses[houseId].lastRankedBids < houses[houseId].bids,
            "House ranking already up to date");

        _rankedHouses.rankScore(
            houseId,
            houses[houseId].lastRankedBids,
            houses[houseId].bids
        );
        houses[houseId].lastRankedBids = houses[houseId].bids;
    }

    function updateCreatorRank(address creator)
        public
        override
    {
        require(
            creatorStats[creator].lastRankedBids < creatorStats[creator].bids,
            "Creator ranking already up to date");

        _rankedCreators.rankScore(
            creator,
            creatorStats[creator].lastRankedBids,
            creatorStats[creator].bids
        );
        creatorStats[creator].lastRankedBids = creatorStats[creator].bids;
    }

    function updateCollectorRank(address collector)
        public
        override
    {
        require(
            collectorStats[collector].lastRankedBids < collectorStats[collector].bids,
            "Collector ranking already up to date");

        _rankedCollectors.rankScore(
            collector,
            collectorStats[collector].lastRankedBids,
            collectorStats[collector].bids
        );
        collectorStats[collector].lastRankedBids = collectorStats[collector].bids;
    }

    function updateContractRank(address tokenContract)
        public
        override
    {
        require(
            contracts[tokenContract].lastRankedBids < contracts[tokenContract].bids,
            "Collection ranking already up to date");

        _rankedContracts.rankScore(
            tokenContract,
            contracts[tokenContract].lastRankedBids,
            contracts[tokenContract].bids
        );
        contracts[tokenContract].lastRankedBids = contracts[tokenContract].bids;
    }

    function _handleOutgoingBid(address to, uint256 amount) internal {
        require(
            _safeTransferETH(to, amount),
            "ETH transfer failed");
    }

    function _safeTransferETH(address to, uint256 value) internal returns (bool) {
        (bool success, ) = to.call{value: value}(new bytes(0));
        return success;
    }

    function _cancelAuction(uint256 auctionId) internal {
        IAuctions.Auction storage auction = auctions[auctionId];

        IERC721(auction.tokenContract).safeTransferFrom(address(this), auction.tokenOwner, auction.tokenId);

        uint256 houseId = auction.houseId;
        if (houseId > 0) {
            _houseAuctions[houseId].remove(auctionId);
            if (houses[houseId].activeAuctions > 0) {
                houses[houseId].activeAuctions -= 1;
            }
        }
        else {
            _activeAuctions.remove(auctionId);
        }

        auction.approved = false;
        bytes32 auctionHash = keccak256(abi.encode(auction.tokenContract, auction.tokenId));
        _previousTokenAuctions[auctionHash].add(auctionId);
        delete tokenAuction[auctionHash];

        emit AuctionCanceled(
            auctionId
        );
    }
}
