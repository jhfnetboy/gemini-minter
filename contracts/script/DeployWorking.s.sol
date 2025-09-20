// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "../src/WorkingFactory.sol";

contract DeployWorkingScript is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("SEPOLIA_PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(privateKeyStr);

        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying WorkingFactory...");
        
        // Deploy the working factory
        WorkingFactory factory = new WorkingFactory();

        vm.stopBroadcast();

        console.log("=== Deployment Results ===");
        console.log("WorkingFactory deployed to:");
        console.logAddress(address(factory));

        // Test the factory
        console.log("=== Testing Factory ===");
        string memory testResult = factory.test();
        console.log("Test result:", testResult);

        console.log("Account implementation:");
        console.logAddress(factory.accountImplementation());

        // Test address calculation
        address testOwner = 0x742d35cC6634c0532925A3b8d39E9C4b73e86E7D;
        uint256 testSalt = 0;
        
        console.log("=== Address Calculation Test ===");
        console.log("Test owner:");
        console.logAddress(testOwner);
        console.log("Salt:");
        console.logUint(testSalt);
        
        address predictedAddress = factory.getCalculatedAddress(testOwner, testSalt);
        console.log("Predicted address (getCalculatedAddress):");
        console.logAddress(predictedAddress);
        
        console.log("Factory address:");
        console.logAddress(address(factory));
        
        console.log("Is same as factory:");
        console.logBool(predictedAddress == address(factory));
        
        // Test with different salt
        uint256 testSalt2 = 1;
        address predictedAddress2 = factory.getCalculatedAddress(testOwner, testSalt2);
        console.log("=== Test Salt=1 ===");
        console.log("Predicted address (salt=1):");
        console.logAddress(predictedAddress2);
        console.log("Different from salt=0:");
        console.logBool(predictedAddress != predictedAddress2);
    }
}
