// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "../src/SimpleAccountFactory.sol";
import "../src/interfaces/IEntryPoint.sol";

contract DeployOfficialFactoryScript is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("SEPOLIA_PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(privateKeyStr);
        
        // EntryPoint v0.6 address for Sepolia (confirmed)
        address entryPointAddress = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("Deploying SimpleAccountFactory...");
        console.log("EntryPoint address:");
        console.logAddress(entryPointAddress);
        
        // Deploy the official SimpleAccountFactory
        SimpleAccountFactory factory = new SimpleAccountFactory(IEntryPoint(entryPointAddress));
        
        vm.stopBroadcast();
        
        console.log("=== Deployment Results ===");
        console.log("SimpleAccountFactory deployed to:");
        console.logAddress(address(factory));
        console.log("Account implementation:");
        console.logAddress(address(factory.accountImplementation()));
        
        // Test address calculation with a sample owner
        address testOwner = 0x742d35cC6634c0532925A3b8d39E9C4b73e86E7D; // example
        uint256 testSalt = 0;
        
        console.log("=== Address Calculation Test ===");
        console.log("Test owner:");
        console.logAddress(testOwner);
        console.log("Salt:");
        console.logUint(testSalt);
        
        address predictedAddress = factory.getAddress(testOwner, testSalt);
        console.log("Predicted address:");
        console.logAddress(predictedAddress);
        
        console.log("Factory address:");
        console.logAddress(address(factory));
        
        console.log("Is same as factory:");
        console.logBool(predictedAddress == address(factory));
        
        if (predictedAddress == address(factory)) {
            console.log("ERROR: Factory returned its own address!");
            revert("Factory address calculation failed");
        } else {
            console.log("SUCCESS: Factory returned different address");
        }
        
        console.log("=== Environment Variables for .env ===");
        console.log("Add this to backend/.env:");
        console.log("SIMPLE_ACCOUNT_FACTORY_ADDRESS=");
        console.logAddress(address(factory));
    }
}
