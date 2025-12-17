// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./OutcomeToken.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title PredictionMarketChainlink
 * @dev Contrat de marché de prédiction avec tokens YES/NO tradables et résolution via Chainlink
 */
contract PredictionMarketChainlink {
    using SafeERC20 for IERC20;

    enum Outcome { UNRESOLVED, YES, NO }

    IERC20 public immutable collateral; // USDC / USDT
    address public owner;

    string public question;
    uint256 public endTime;
    Outcome public result;
    bool public resolved;

    OutcomeToken public yesToken;
    OutcomeToken public noToken;

    uint256 public totalCollateral;

    AggregatorV3Interface public priceFeed;
    int256 public targetPrice; // Prix cible pour YES (en unités du feed Chainlink, généralement 1e8)

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAfterEnd() {
        require(block.timestamp >= endTime, "Market not ended");
        _;
    }

    event MarketCreated(string question, uint256 endTime, address yesToken, address noToken);
    event PositionBought(address indexed buyer, bool yes, uint256 amount);
    event MarketResolved(Outcome result);
    event Redeemed(address indexed user, uint256 amount);

    constructor(
        string memory _question,
        uint256 _endTime,
        address _collateral,
        address _priceFeed,
        int256 _targetPrice
    ) {
        require(_endTime > block.timestamp, "Invalid end time");
        require(_collateral != address(0), "Invalid collateral");
        require(_priceFeed != address(0), "Invalid price feed");
        
        owner = msg.sender;
        question = _question;
        endTime = _endTime;
        collateral = IERC20(_collateral);

        yesToken = new OutcomeToken(
            string(abi.encodePacked("YES: ", _question)),
            "YES",
            address(this)
        );
        noToken = new OutcomeToken(
            string(abi.encodePacked("NO: ", _question)),
            "NO",
            address(this)
        );

        priceFeed = AggregatorV3Interface(_priceFeed);
        targetPrice = _targetPrice;

        emit MarketCreated(_question, _endTime, address(yesToken), address(noToken));
    }

    /**
     * @dev Acheter des tokens YES ou NO en déposant du collateral
     * @param yes true pour YES, false pour NO
     * @param amount Montant de collateral à déposer (en unités du token, ex: 1e6 pour USDC)
     */
    function buy(bool yes, uint256 amount) external {
        require(block.timestamp < endTime, "Market closed");
        require(amount > 0, "Invalid amount");

        collateral.safeTransferFrom(msg.sender, address(this), amount);
        totalCollateral += amount;

        if (yes) {
            yesToken.mint(msg.sender, amount);
        } else {
            noToken.mint(msg.sender, amount);
        }

        emit PositionBought(msg.sender, yes, amount);
    }

    /**
     * @dev Résoudre le marché automatiquement via Chainlink (après endTime)
     */
    function resolve() external onlyAfterEnd {
        require(!resolved, "Already resolved");

        (
            ,
            int256 price,
            ,
            ,
            
        ) = priceFeed.latestRoundData();

        if (price >= targetPrice) {
            result = Outcome.YES;
        } else {
            result = Outcome.NO;
        }

        resolved = true;
        emit MarketResolved(result);
    }

    /**
     * @dev Résoudre manuellement (fallback si Chainlink échoue)
     */
    function resolveManually(Outcome _result) external onlyOwner {
        require(!resolved, "Already resolved");
        require(_result != Outcome.UNRESOLVED, "Invalid result");
        require(block.timestamp >= endTime, "Market not ended");

        result = _result;
        resolved = true;
        emit MarketResolved(result);
    }

    /**
     * @dev Récupérer le collateral en échangeant les tokens gagnants
     * @param amount Montant de tokens à échanger
     */
    function redeem(uint256 amount) external {
        require(resolved, "Not resolved");
        require(amount > 0, "Invalid amount");

        if (result == Outcome.YES) {
            yesToken.burn(msg.sender, amount);
        } else {
            noToken.burn(msg.sender, amount);
        }

        collateral.safeTransfer(msg.sender, amount);
        emit Redeemed(msg.sender, amount);
    }

    /**
     * @dev Obtenir les balances YES et NO d'un utilisateur
     */
    function getUserBalances(address user) external view returns (uint256 yesBalance, uint256 noBalance) {
        yesBalance = yesToken.balanceOf(user);
        noBalance = noToken.balanceOf(user);
    }

    /**
     * @dev Obtenir les informations du marché
     */
    function getMarketInfo() external view returns (
        string memory _question,
        uint256 _endTime,
        uint256 _totalCollateral,
        Outcome _result,
        bool _resolved,
        address _yesToken,
        address _noToken
    ) {
        return (
            question,
            endTime,
            totalCollateral,
            result,
            resolved,
            address(yesToken),
            address(noToken)
        );
    }

    /**
     * @dev Obtenir le prix actuel depuis Chainlink
     */
    function getCurrentPrice() external view returns (int256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price;
    }
}
