// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import { ITux } from "./ITux.sol";


contract Collection is
    ITux,
    ERC721,
    ERC721URIStorage,
    ERC721Enumerable,
    ERC721Burnable,
    ReentrancyGuard
{
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.UintSet;

    address public owner;

    string private _baseTokenURI = 'ipfs://';

    Counters.Counter private _tokenIdTracker;

    mapping(uint256 => address) public tokenCreators;

    mapping(address => EnumerableSet.UintSet) private _creatorTokens;


    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {
        owner = msg.sender;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);

        address creator = tokenCreators[tokenId];
        delete tokenCreators[tokenId];
        _creatorTokens[creator].remove(tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function tokenCreator(uint256 tokenId) public view override returns (address) {
        return tokenCreators[tokenId];
    }

    function getCreatorTokens(address creator) public view override returns (uint256[] memory) {
        return _creatorTokens[creator].values();
    }

    function tokenURI(uint256 tokenId)
        public view virtual override(ERC721, ERC721URIStorage) returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function mint(string memory _tokenURI)
        public
        nonReentrant
    {
        require(msg.sender == owner, 'Must be owner');
        require(bytes(_tokenURI).length != 0, 'Empty tokenURI');

        _tokenIdTracker.increment();

        uint256 tokenId = _tokenIdTracker.current();

        _safeMint(msg.sender, tokenId);

        _setTokenURI(tokenId, _tokenURI);

        _creatorTokens[msg.sender].add(tokenId);

        tokenCreators[tokenId] = msg.sender;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
