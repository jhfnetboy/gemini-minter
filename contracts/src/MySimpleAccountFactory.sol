// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

// Import the official SimpleAccountFactory
import "../lib/account-abstraction/contracts/accounts/SimpleAccountFactory.sol";
import "../lib/account-abstraction/contracts/accounts/SimpleAccount.sol";
import "../lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";

/**
 * A wrapper around the official SimpleAccountFactory for deployment
 */
contract MySimpleAccountFactory is SimpleAccountFactory {
    constructor(IEntryPoint _entryPoint) SimpleAccountFactory(_entryPoint) {}
}
