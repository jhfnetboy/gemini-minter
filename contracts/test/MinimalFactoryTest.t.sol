// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../src/MinimalSimpleAccountFactory.sol";
import "../src/interfaces/IEntryPoint.sol";

contract MinimalFactoryTest is Test {
    MinimalSimpleAccountFactory factory;
    IEntryPoint entryPoint;
    
    address testOwner = 0x742d35cC6634c0532925A3b8d39E9C4b73e86E7D;
    
    function setUp() public {
        // Deploy mock EntryPoint
        entryPoint = IEntryPoint(address(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789));
        
        // Deploy factory
        factory = new MinimalSimpleAccountFactory(entryPoint);
    }
    
    function testGetAddressReturnsDifferentFromFactory() public {
        address factoryAddr = address(factory);
        address predictedAddr = factory.getAddress(testOwner, 0);
        
        console.log("Factory address:", factoryAddr);
        console.log("Predicted address:", predictedAddr);
        
        // The predicted address should NOT be the same as factory address
        assertNotEq(predictedAddr, factoryAddr, "Predicted address should not equal factory address");
    }
    
    function testGetAddressDifferentSalts() public {
        address addr1 = factory.getAddress(testOwner, 0);
        address addr2 = factory.getAddress(testOwner, 1);
        address addr3 = factory.getAddress(testOwner, 12345);
        
        console.log("Salt 0:", addr1);
        console.log("Salt 1:", addr2);
        console.log("Salt 12345:", addr3);
        
        // Different salts should produce different addresses
        assertNotEq(addr1, addr2, "Different salts should produce different addresses");
        assertNotEq(addr1, addr3, "Different salts should produce different addresses");
        assertNotEq(addr2, addr3, "Different salts should produce different addresses");
    }
    
    function testGetAddressSameOwnerSameSalt() public {
        address addr1 = factory.getAddress(testOwner, 0);
        address addr2 = factory.getAddress(testOwner, 0);
        
        // Same owner and salt should produce same address
        assertEq(addr1, addr2, "Same owner and salt should produce same address");
    }
    
    function testGetAddressDifferentOwners() public {
        address owner1 = 0x742d35cC6634c0532925A3b8d39E9C4b73e86E7D;
        address owner2 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        
        address addr1 = factory.getAddress(owner1, 0);
        address addr2 = factory.getAddress(owner2, 0);
        
        console.log("Owner1 address:", addr1);
        console.log("Owner2 address:", addr2);
        
        // Different owners should produce different addresses
        assertNotEq(addr1, addr2, "Different owners should produce different addresses");
    }
}
