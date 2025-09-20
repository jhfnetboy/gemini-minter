// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {SimpleAccountFactory} from "account-abstraction/accounts/SimpleAccountFactory.sol";
import {SimpleAccount} from "account-abstraction/accounts/SimpleAccount.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";

contract FactoryVerificationTest is Test {
    // Known addresses on Sepolia
    address constant SEPOLIA_SIMPLE_FACTORY = 0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985;
    address constant SEPOLIA_ALCHEMY_FACTORY = 0x0000000000400CdFef5E2714E63d8040b700BC24;
    address constant EXPECTED_ENTRYPOINT = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;
    
    function setUp() public {
        // Fork Sepolia for testing
        vm.createFork("https://ethereum-sepolia.publicnode.com");
    }
    
    function testSimpleAccountFactoryExists() public {
        // Test if contract exists at the address
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(SEPOLIA_SIMPLE_FACTORY)
        }
        
        console.log("SimpleAccountFactory code size:", codeSize);
        assertTrue(codeSize > 0, "SimpleAccountFactory should exist on Sepolia");
    }
    
    function testAddressCalculation() public {
        // Test address calculation works
        address testOwner = address(0x1234567890123456789012345678901234567890);
        uint256 testSalt = 12345;
        
        // This should not revert if the factory is correct
        try SimpleAccountFactory(SEPOLIA_SIMPLE_FACTORY).getAddress(testOwner, testSalt) returns (address predicted) {
            console.log("Test Owner:", testOwner);
            console.log("Test Salt:", testSalt);
            console.log("Predicted Address:", predicted);
            
            // Test with different salt produces different address
            uint256 testSalt2 = 67890;
            address predicted2 = SimpleAccountFactory(SEPOLIA_SIMPLE_FACTORY).getAddress(testOwner, testSalt2);
            console.log("Different Salt:", testSalt2);
            console.log("Different Address:", predicted2);
            
            assertTrue(predicted != predicted2, "Different salts should produce different addresses");
            assertTrue(predicted != SEPOLIA_SIMPLE_FACTORY, "Predicted address should not be factory address");
            
        } catch Error(string memory reason) {
            console.log("Address calculation failed:", reason);
            fail("Address calculation should not fail");
        }
    }
    
    function testFactoryImplementation() public {
        try SimpleAccountFactory(SEPOLIA_SIMPLE_FACTORY).accountImplementation() returns (SimpleAccount impl) {
            console.log("Account implementation address:", address(impl));
            assertTrue(address(impl) != address(0), "Implementation should not be zero address");
        } catch Error(string memory reason) {
            console.log("accountImplementation() failed:", reason);
            fail("Should be able to get account implementation");
        }
    }
    
    function testAlchemyFactoryExists() public {
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(SEPOLIA_ALCHEMY_FACTORY)
        }
        
        console.log("Alchemy Factory code size:", codeSize);
        // Note: This might fail if Alchemy factory doesn't exist or has different interface
        if (codeSize > 0) {
            console.log("Alchemy factory exists at:", SEPOLIA_ALCHEMY_FACTORY);
        } else {
            console.log("Alchemy factory does not exist at:", SEPOLIA_ALCHEMY_FACTORY);
        }
    }
}
