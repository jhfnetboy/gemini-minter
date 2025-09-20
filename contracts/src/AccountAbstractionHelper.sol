// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {SimpleAccountFactory} from "account-abstraction/accounts/SimpleAccountFactory.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";

contract AccountAbstractionHelper {
    struct NetworkConfig {
        uint256 chainId;
        string name;
        address entryPoint;
        address simpleAccountFactory;
        bool isSupported;
    }

    mapping(uint256 => NetworkConfig) public networks;

    constructor() {
        _initializeNetworks();
    }

    function _initializeNetworks() private {
        // Sepolia Testnet
        networks[11155111] = NetworkConfig({
            chainId: 11155111,
            name: "Sepolia",
            entryPoint: 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789,
            simpleAccountFactory: 0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985,
            isSupported: true
        });
    }

    function calculateAccountAddress(address owner, uint256 salt) 
        external 
        view 
        returns (address predictedAddress) 
    {
        NetworkConfig memory config = networks[block.chainid];
        require(config.isSupported, "Network not supported");
        require(config.simpleAccountFactory != address(0), "Factory not configured");
        
        SimpleAccountFactory factory = SimpleAccountFactory(config.simpleAccountFactory);
        predictedAddress = factory.getAddress(owner, salt);
    }
}
