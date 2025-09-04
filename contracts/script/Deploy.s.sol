// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MyNFT.sol";
import "../src/MySBT.sol";
import "../src/PNTs.sol";

contract Deploy is Script {
    function run() external returns (address, address, address) {
        uint256 deployerPrivateKey = vm.envUint("SEPOLIA_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        MyNFT myNFT = new MyNFT();
        MySBT mySBT = new MySBT();
        PNTs pnts = new PNTs();

        vm.stopBroadcast();

        console.log("MyNFT deployed to:", address(myNFT));
        console.log("MySBT deployed to:", address(mySBT));
        console.log("PNTs deployed to:", address(pnts));

        return (address(myNFT), address(mySBT), address(pnts));
    }
}