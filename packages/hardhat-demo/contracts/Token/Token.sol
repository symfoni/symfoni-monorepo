pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";

contract Token is ERC20Burnable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 amount
    ) public ERC20(name, symbol) {
        _mint(msg.sender, amount);
    }
}
