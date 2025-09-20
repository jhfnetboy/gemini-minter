// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import "forge-std/Script.sol";

contract CheckEntryPointScript is Script {
    function run() external {
        // EntryPoint v0.6 address for Sepolia
        address entryPointV06 = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;
        // EntryPoint v0.7 address
        address entryPointV07 = 0x0000000071727De22E5E9d8BAf0edAc6f37da032;
        
        console.log("Checking EntryPoint contracts on Sepolia...");
        
        console.log("EntryPoint v0.6:");
        console.logAddress(entryPointV06);
        console.log("Code length:");
        console.logUint(entryPointV06.code.length);
        
        console.log("EntryPoint v0.7:");
        console.logAddress(entryPointV07);
        console.log("Code length:");
        console.logUint(entryPointV07.code.length);
        
        if (entryPointV06.code.length > 2) {
            console.log("EntryPoint v0.6 exists!");
        } else {
            console.log("EntryPoint v0.6 NOT found!");
        }
        
        if (entryPointV07.code.length > 2) {
            console.log("EntryPoint v0.7 exists!");
        } else {
            console.log("EntryPoint v0.7 NOT found!");
        }
    }
}
