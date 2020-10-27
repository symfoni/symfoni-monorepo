// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract Testing {
    uint256 internal _number;

    function get_number() public view returns (uint256) {
        return _number;
    }

    function set_number(uint256 number) external {
        _number = number;
    }
}
