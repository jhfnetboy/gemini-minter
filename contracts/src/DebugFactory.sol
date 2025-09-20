// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

/**
 * Debug factory to isolate the getAddress issue
 */
contract DebugFactory {
    
    /**
     * Just return a hardcoded address to test basic functionality
     */
    function getAddress(address owner, uint256 salt) public pure returns (address) {
        // Return a completely different hardcoded address
        return 0x1234567890123456789012345678901234567890;
    }
    
    /**
     * Return the actual calculated address
     */
    function getCalculatedAddress(address owner, uint256 salt) public view returns (address) {
        bytes32 hash = keccak256(abi.encodePacked(owner, salt, block.chainid));
        return address(uint160(uint256(hash)));
    }
    
    /**
     * Return multiple values for debugging
     */
    function getDebugInfo(address owner, uint256 salt) public view returns (
        address hardcoded,
        address calculated,
        address factoryAddr,
        uint256 chainId,
        bytes32 hash
    ) {
        hardcoded = 0x1234567890123456789012345678901234567890;
        
        chainId = block.chainid;
        hash = keccak256(abi.encodePacked(owner, salt, chainId));
        calculated = address(uint160(uint256(hash)));
        
        factoryAddr = address(this);
    }
    
    /**
     * Test function
     */
    function test() public pure returns (string memory) {
        return "Debug factory working!";
    }
}
