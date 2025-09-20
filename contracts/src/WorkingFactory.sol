// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./SimpleAccount.sol";
import "./interfaces/IEntryPoint.sol";

/**
 * Working factory with renamed function to avoid ethers.js Contract bug
 */
contract WorkingFactory {
    
    address public immutable accountImplementation;
    address public immutable entryPoint;
    
    constructor() {
        entryPoint = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789; // EntryPoint v0.6 Sepolia
        accountImplementation = address(new SimpleAccount(IEntryPoint(entryPoint)));
    }
    
    /**
     * Calculate the predicted address for a smart account (renamed from getAddress)
     * @param owner The owner address for the smart account
     * @param salt The salt value for CREATE2
     * @return The predicted address of the smart account
     */
    function getCalculatedAddress(address owner, uint256 salt) public view returns (address) {
        return Create2.computeAddress(bytes32(salt), keccak256(abi.encodePacked(
                type(ERC1967Proxy).creationCode,
                abi.encode(
                    address(accountImplementation),
                    abi.encodeCall(SimpleAccount.initialize, (owner))
                )
            )));
    }
    
    /**
     * Create a new smart account
     * @param owner The owner address for the smart account
     * @param salt The salt value for CREATE2
     * @return ret The address of the created smart account
     */
    function createAccount(address owner, uint256 salt) public returns (address ret) {
        address addr = getCalculatedAddress(owner, salt);
        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            return addr;
        }
        ret = address(new ERC1967Proxy{salt: bytes32(salt)}(
            address(accountImplementation),
            abi.encodeCall(SimpleAccount.initialize, (owner))
        ));
    }
    
    /**
     * Test function
     */
    function test() public pure returns (string memory) {
        return "Working factory with getCalculatedAddress!";
    }
}
