// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

/**
 * Ultra simple factory for testing Create2 without any dependencies
 */
contract UltraSimpleFactory {
    
    /**
     * Calculate a Create2 address using the simplest possible method
     */
    function getAddress(address owner, uint256 salt) public view returns (address) {
        // Use a very simple fixed bytecode
        bytes memory initCode = hex"6080604052348015600f57600080fd5b50600080fd";
        
        // Combine with owner to make it unique
        bytes memory fullCode = abi.encodePacked(initCode, abi.encode(owner));
        
        // Use manual Create2 calculation
        bytes32 hash = keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            bytes32(salt),
            keccak256(fullCode)
        ));
        
        return address(uint160(uint256(hash)));
    }
    
    /**
     * Test function
     */
    function test() public pure returns (string memory) {
        return "Ultra simple factory working!";
    }
}
