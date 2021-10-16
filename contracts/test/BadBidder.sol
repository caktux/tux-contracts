// SPDX-License-Identifier: GPL-3.0

// FOR TEST PURPOSES ONLY. NOT PRODUCTION SAFE
pragma solidity 0.8.9;
import {IAuctions} from "../IAuctions.sol";

// This contract is meant to mimic a bidding contract that does not implement on IERC721 Received,
// and thus should cause a revert when an auction is finalized with this as the winning bidder.
contract BadBidder {
    address auction;
    address tux;

    constructor(address _auction, address _tux) {
        auction = _auction;
        tux = _tux;
    }

    function placeBid(uint256 auctionId) external payable {
        IAuctions(auction).createBid{value: msg.value}(auctionId);
    }

    receive() external payable {}
    fallback() external payable {}
}
