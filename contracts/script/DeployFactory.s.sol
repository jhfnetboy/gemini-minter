// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "../src/MySimpleAccountFactory.sol";
import "../lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";

contract DeployFactoryScript is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("SEPOLIA_PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(privateKeyStr);
        
        // EntryPoint address for Sepolia
        address entryPointAddress = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the factory
        MySimpleAccountFactory factory = new MySimpleAccountFactory(IEntryPoint(entryPointAddress));
        
        vm.stopBroadcast();
        
        console.log("MySimpleAccountFactory deployed to:");
        console.logAddress(address(factory));
        console.log("EntryPoint address:");
        console.logAddress(entryPointAddress);
        console.log("Account implementation:");
        console.logAddress(address(factory.accountImplementation()));
        
        // Test address calculation
        address testOwner = 0x742d35cC6634c0532925A3b8d39E9C4b73e86E7D; // example
        uint256 testSalt = 0;
        address predictedAddress = factory.getAddress(testOwner, testSalt);
        console.log("Predicted address for test:");
        console.logAddress(predictedAddress);
        console.log("Is factory address?");
        console.logBool(predictedAddress == address(factory));
    }
}
