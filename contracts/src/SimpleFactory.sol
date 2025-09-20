// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Create2.sol";

/**
 * A very simple factory for testing address calculation
 * No dependencies, just pure Create2 logic
 */
contract SimpleFactory {
    address public immutable implementation;
    
    constructor() {
        // Create a dummy implementation address for testing
        implementation = address(0x1234567890123456789012345678901234567890);
    }
    
    /**
     * Calculate the counterfactual address using Create2
     */
    function getAddress(address owner, uint256 salt) public view returns (address) {
        bytes memory initCode = abi.encodePacked(
            type(TestProxy).creationCode,
            abi.encode(implementation, abi.encodeWithSignature("initialize(address)", owner))
        );
        
        return Create2.computeAddress(bytes32(salt), keccak256(initCode));
    }
    
    /**
     * Test function to verify the factory is working
     */
    function test() public pure returns (string memory) {
        return "Factory is working!";
    }
}

/**
 * Minimal proxy contract for testing
 */
contract TestProxy {
    address public implementation;
    address public owner;
    
    constructor(address _implementation, bytes memory _data) {
        implementation = _implementation;
        if (_data.length > 0) {
            (bool success,) = address(this).call(_data);
            require(success, "Initialization failed");
        }
    }
    
    function initialize(address _owner) public {
        require(owner == address(0), "Already initialized");
        owner = _owner;
    }
}
