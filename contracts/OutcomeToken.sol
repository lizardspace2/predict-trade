// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title OutcomeToken
 * @dev Token ERC20 représentant une position YES ou NO dans un marché de prédiction
 */
contract OutcomeToken is ERC20 {
    address public market;

    modifier onlyMarket() {
        require(msg.sender == market, "Only market");
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address _market
    ) ERC20(name, symbol) {
        market = _market;
    }

    /**
     * @dev Mint des tokens (seulement le contrat de marché peut le faire)
     */
    function mint(address to, uint256 amount) external onlyMarket {
        _mint(to, amount);
    }

    /**
     * @dev Burn des tokens (seulement le contrat de marché peut le faire)
     */
    function burn(address from, uint256 amount) external onlyMarket {
        _burn(from, amount);
    }
}
