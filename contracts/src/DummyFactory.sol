// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

/**
 * Dummy factory that just returns a simple calculated address for testing
 */
contract DummyFactory {
    
    /**
     * Return a simple calculated address (not Create2, just for testing)
     */
    function getAddress(address owner, uint256 salt) public view returns (address) {
        // Simple calculation that should always work
        bytes32 hash = keccak256(abi.encodePacked(owner, salt, block.chainid));
        return address(uint160(uint256(hash)));
    }
    
    /**
     * Test function
     */
    function test() public pure returns (string memory) {
        return "Dummy factory working!";
    }
    
    /**
     * Simple function that just returns the input
     */
    function echo(address input) public pure returns (address) {
        return input;
    }
}
