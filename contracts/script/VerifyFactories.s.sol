// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {SimpleAccountFactory} from "account-abstraction/accounts/SimpleAccountFactory.sol";
import {SimpleAccount} from "account-abstraction/accounts/SimpleAccount.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";

/**
 * @title VerifyFactories
 * @dev Script to verify ERC-4337 factory addresses on different networks
 * Usage: forge script script/VerifyFactories.s.sol --rpc-url $SEPOLIA_RPC_URL
 */
contract VerifyFactories is Script {
    
    struct FactoryInfo {
        string name;
        address factory;
        address entryPoint;
        bool isValid;
        string error;
    }
    
    // Known factory addresses to verify
    address constant SEPOLIA_SIMPLE_FACTORY = 0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985;
    address constant SEPOLIA_ALCHEMY_FACTORY = 0x0000000000400CdFef5E2714E63d8040b700BC24;
    address constant EXPECTED_ENTRYPOINT = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;
    
    function run() external view {
        console.log("=== ERC-4337 Factory Verification ===");
        console.log("Network Chain ID:", block.chainid);
        console.log("Expected EntryPoint:", EXPECTED_ENTRYPOINT);
        console.log("");
        
        // Verify SimpleAccountFactory
        FactoryInfo memory simpleInfo = verifyFactory(
            "SimpleAccountFactory", 
            SEPOLIA_SIMPLE_FACTORY,
            EXPECTED_ENTRYPOINT
        );
        printFactoryInfo(simpleInfo);
        
        // Verify Alchemy LightAccountFactory  
        FactoryInfo memory alchemyInfo = verifyFactory(
            "Alchemy LightAccountFactory",
            SEPOLIA_ALCHEMY_FACTORY, 
            EXPECTED_ENTRYPOINT
        );
        printFactoryInfo(alchemyInfo);
        
        // Test address calculation
        if (simpleInfo.isValid) {
            testAddressCalculation(SEPOLIA_SIMPLE_FACTORY);
        }
    }
    
    function verifyFactory(
        string memory name,
        address factoryAddr,
        address expectedEntryPoint
    ) internal view returns (FactoryInfo memory info) {
        info.name = name;
        info.factory = factoryAddr;
        info.entryPoint = expectedEntryPoint;
        
        // Check if contract exists
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(factoryAddr)
        }
        
        if (codeSize == 0) {
            info.isValid = false;
            info.error = "No contract at address";
            return info;
        }
        
        try SimpleAccountFactory(factoryAddr).accountImplementation() returns (SimpleAccount impl) {
            console.log("Account implementation:", address(impl));
            info.isValid = true;
        } catch {
            info.isValid = false;
            info.error = "Failed to call accountImplementation()";
        }
    }
    
    function printFactoryInfo(FactoryInfo memory info) internal pure {
        console.log("--- %s ---", info.name);
        console.log("Address:", info.factory);
        console.log("Valid:", info.isValid);
        if (!info.isValid) {
            console.log("Error:", info.error);
        }
        console.log("");
    }
    
    function testAddressCalculation(address factoryAddr) internal view {
        console.log("=== Testing Address Calculation ===");
        
        // Test with a sample owner and salt
        address testOwner = 0x1234567890123456789012345678901234567890;
        uint256 testSalt = 12345;
        
        try SimpleAccountFactory(factoryAddr).getAddress(testOwner, testSalt) returns (address predicted) {
            console.log("Test Owner:", testOwner);
            console.log("Test Salt:", testSalt);
            console.log("Predicted Address:", predicted);
            
            // Check if this address would be different with different salt
            uint256 testSalt2 = 67890;
            address predicted2 = SimpleAccountFactory(factoryAddr).getAddress(testOwner, testSalt2);
            console.log("Different Salt:", testSalt2);
            console.log("Different Address:", predicted2);
            console.log("Addresses are different:", predicted != predicted2);
            
        } catch Error(string memory reason) {
            console.log("Address calculation failed:", reason);
        }
        
        console.log("");
    }
}
