// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CredentialSBT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIds;
    string private _baseTokenURI;

    mapping(uint256 => string) private _credentialHashes;
    mapping(address => uint256[]) private _holderTokens;

    event CredentialIssued(address indexed to, uint256 indexed tokenId, string credentialHash);

    constructor(string memory name, string memory symbol, string memory baseURI) 
        ERC721(name, symbol) 
        Ownable(msg.sender) 
    {
        _baseTokenURI = baseURI;
    }

    function issueCredential(address to, string memory credentialHash) external onlyOwner returns (uint256) {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, _baseTokenURI);
        _credentialHashes[newTokenId] = credentialHash;
        _holderTokens[to].push(newTokenId);

        emit CredentialIssued(to, newTokenId, credentialHash);

        return newTokenId;
    }

    function getCredentialHash(uint256 tokenId) external view returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return _credentialHashes[tokenId];
    }

    function getHolderTokens(address holder) external view returns (uint256[] memory) {
        return _holderTokens[holder];
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _transfer(address from, address to, uint256 tokenId, bytes memory data) internal override {
        require(false, "Transfer not allowed for Soulbound Tokens");
    }
}
