// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/SimpleAccountFactoryV07NoSenderCreator.sol";

contract DeploySimpleAccountFactoryV07 is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address entryPoint = vm.envAddress("ENTRYPOINT_V07");

        vm.startBroadcast(deployerPrivateKey);

        SimpleAccountFactoryV07NoSenderCreator factory = new SimpleAccountFactoryV07NoSenderCreator(
            IEntryPoint(entryPoint)
        );

        console.log("SimpleAccountFactoryV07NoSenderCreator deployed at:", address(factory));
        console.log("EntryPoint:", entryPoint);
        console.log("AccountImplementation:", address(factory.accountImplementation()));

        vm.stopBroadcast();
    }
}
