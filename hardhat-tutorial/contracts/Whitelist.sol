// SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

contract WhiteList{

    // Max number of whitelisted addresses allowed

    uint8 public maxWhitelistedAddresses;

    // Create a mapping of whitelistedAddresses
    //if an address is whitelisted, we will set it to true by default it is false for all addresses

    mapping(address=>bool)public whitelistedAddresses;

    //numAddressesWhitelisted would be used to keep track of how many addresses have been whitelisted
    //NOTE: Don't change this variable name, as it will be part of the verification

    uint8 public numAddressesWhitelisted;

    constructor(uint8 _maxWhitelistedAddresses){
        maxWhitelistedAddresses = _maxWhitelistedAddresses;

    }

    /**
    *addAddressToWhiteList- Function adds the address of the sender to the whitelist
     */

    function addAddressToWhitelist()public {
        require(!whitelistedAddresses[msg.sender],"Sender has already been whitelisted");

        require(numAddressesWhitelisted < maxWhitelistedAddresses,"More addresses cannot be added. Max limit reached");

        whitelistedAddresses[msg.sender]=true;

        numAddressesWhitelisted +=1;
        
    }
}
