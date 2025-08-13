// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./RoscaPoolUpgradeable.sol";
import "./Tree.sol";

contract PoolFactoryUpgradeable is Initializable, OwnableUpgradeable {
    address public treeContract;
    address public treeCreator;
    
    event PoolCreated(address indexed pool, address indexed creator, uint256 size, uint256 contribution, uint256 roundDuration, uint256 startTime);

    address[] public allPools;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        // Simple constructor for Truffle compatibility
    }

    function initialize(address _treeContract) public initializer {
        require(_treeContract != address(0), "tree addr");
        
        __Ownable_init(msg.sender);
        
        treeContract = _treeContract;
        treeCreator = Tree(_treeContract).top();
    }

    modifier onlyEligibleCreator() {
        bool isCreator = (msg.sender == treeCreator);
        bool hasDepth = Tree(treeContract).hasTwoLevelDownline(msg.sender);
        require(isCreator || hasDepth, "need 2-level downline or tree creator");
        _;
    }

    function createPool(
        uint256 size,
        uint256 contribution,
        uint256 roundDuration,
        uint256 startTime,
        address[] calldata payoutOrder
    ) external onlyEligibleCreator returns (address pool) {
        require(size >= 2 && size <= 12, "Size out of range");
        require(payoutOrder.length == size, "Order size mismatch");
        
        RoscaPoolUpgradeable newPool = new RoscaPoolUpgradeable();
        newPool.initialize(msg.sender, size, contribution, roundDuration, startTime, payoutOrder);
        
        pool = address(newPool);
        allPools.push(pool);
        
        emit PoolCreated(pool, msg.sender, size, contribution, roundDuration, startTime);
    }

    function getPools() external view returns (address[] memory) {
        return allPools;
    }

    // Upgrade function (simplified for Truffle)
    function upgradeTo(address newImplementation) external onlyOwner {
        // Basic upgrade logic - in production, use proper proxy pattern
    }
}
