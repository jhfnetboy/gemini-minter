// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "../src/DebugFactory.sol";

contract DeployDebugScript is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("SEPOLIA_PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(privateKeyStr);

        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying DebugFactory...");
        
        // Deploy the debug factory
        DebugFactory factory = new DebugFactory();

        vm.stopBroadcast();

        console.log("=== Deployment Results ===");
        console.log("DebugFactory deployed to:");
        console.logAddress(address(factory));

        // Test the factory
        console.log("=== Testing Factory ===");
        string memory testResult = factory.test();
        console.log("Test result:", testResult);

        // Test address calculation
        address testOwner = 0x742d35cC6634c0532925A3b8d39E9C4b73e86E7D;
        uint256 testSalt = 0;
        
        console.log("=== Function Tests ===");
        console.log("Test owner:");
        console.logAddress(testOwner);
        console.log("Salt:");
        console.logUint(testSalt);
        
        // Test getAddress (should return hardcoded)
        address hardcodedResult = factory.getAddress(testOwner, testSalt);
        console.log("getAddress (hardcoded) result:");
        console.logAddress(hardcodedResult);
        console.log("Is hardcoded 0x1234...?");
        console.logBool(hardcodedResult == 0x1234567890123456789012345678901234567890);
        
        // Test getCalculatedAddress
        address calculatedResult = factory.getCalculatedAddress(testOwner, testSalt);
        console.log("getCalculatedAddress result:");
        console.logAddress(calculatedResult);
        
        // Test getDebugInfo
        (address hardcoded, address calculated, address factoryAddr, uint256 chainId, bytes32 hash) = 
            factory.getDebugInfo(testOwner, testSalt);
        
        console.log("=== Debug Info ===");
        console.log("Hardcoded:");
        console.logAddress(hardcoded);
        console.log("Calculated:");
        console.logAddress(calculated);
        console.log("Factory address:");
        console.logAddress(factoryAddr);
        console.log("Chain ID:");
        console.logUint(chainId);
        console.log("Hash:");
        console.logBytes32(hash);
        
        console.log("=== Verification ===");
        console.log("Factory == this:");
        console.logBool(factoryAddr == address(factory));
        console.log("Calculated == hardcoded:");
        console.logBool(calculated == hardcoded);
    }
}
