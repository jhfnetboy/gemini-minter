// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import "forge-std/Script.sol";

contract TestFactoryScript is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("SEPOLIA_PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(privateKeyStr);
        
        // Test EntryPoint addresses
        address entryPointV06 = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;
        address entryPointV07 = 0x0000000071727De22E5E9d8BAf0edAc6f37da032;
        
        // No broadcast needed for view calls
        
        // Check if EntryPoint contracts exist
        console.log("Checking EntryPoint v0.6:");
        console.logAddress(entryPointV06);
        console.logUint(entryPointV06.code.length);
        
        console.log("Checking EntryPoint v0.7:");
        console.logAddress(entryPointV07);
        console.logUint(entryPointV07.code.length);
        
        // End of test
    }
}
