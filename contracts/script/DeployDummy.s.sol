// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "../src/DummyFactory.sol";

contract DeployDummyScript is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("SEPOLIA_PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(privateKeyStr);

        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying DummyFactory...");
        
        // Deploy the dummy factory
        DummyFactory factory = new DummyFactory();

        vm.stopBroadcast();

        console.log("=== Deployment Results ===");
        console.log("DummyFactory deployed to:");
        console.logAddress(address(factory));

        // Test the factory
        console.log("=== Testing Factory ===");
        string memory testResult = factory.test();
        console.log("Test result:", testResult);

        // Test address calculation
        address testOwner = 0x742d35cC6634c0532925A3b8d39E9C4b73e86E7D;
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
        
        // Test echo function
        address echoResult = factory.echo(testOwner);
        console.log("Echo test:");
        console.logAddress(echoResult);
        console.log("Echo matches input:");
        console.logBool(echoResult == testOwner);
    }
}
