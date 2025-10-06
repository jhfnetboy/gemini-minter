// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/SimpleAccountFactory.sol";
import "../src/SimpleAccount.sol";
import "../src/interfaces/IEntryPoint.sol";

contract DeploySimpleAccountFactoryV07Simple is Script {
    address constant ENTRYPOINT_V07 = 0x0000000071727De22E5E9d8BAf0edAc6f37da032;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.envAddress("OWNER_ADDRESS");

        console.log("Deployer:", deployer);
        console.log("EntryPoint v0.7:", ENTRYPOINT_V07);

        vm.startBroadcast(deployerPrivateKey);

        SimpleAccountFactory factory = new SimpleAccountFactory(IEntryPoint(ENTRYPOINT_V07));

        vm.stopBroadcast();

        console.log("Factory:", address(factory));
        console.log("Implementation:", address(factory.accountImplementation()));

        uint256 salt = 0;
        address predicted = factory.getAddress(deployer, salt);
        console.log("Predicted Account (salt=0):", predicted);
    }
}
