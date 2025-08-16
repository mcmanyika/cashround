// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./RoscaPoolPOL.sol";
import "./Tree.sol";

contract PoolFactoryPOL {
    address public immutable treeContract;
    address public immutable treeCreator;
    address public immutable polToken;
    
    event PoolCreated(address indexed pool, address indexed creator, uint256 size, uint256 contribution, uint256 roundDuration, uint256 startTime);

    address[] public allPools;

    constructor(address _treeContract, address _polToken) {
        require(_treeContract != address(0), "tree addr");
        require(_polToken != address(0), "pol token addr");
        treeContract = _treeContract;
        treeCreator = Tree(_treeContract).top();
        polToken = _polToken;
    }

    modifier onlyEligibleCreator() {
        // Eligible if Tree creator OR member with at least two-level downline
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
        RoscaPoolPOL newPool = new RoscaPoolPOL(polToken, msg.sender, size, contribution, roundDuration, startTime, payoutOrder);
        pool = address(newPool);
        allPools.push(pool);
        emit PoolCreated(pool, msg.sender, size, contribution, roundDuration, startTime);
    }

    function getPools() external view returns (address[] memory) {
        return allPools;
    }
}
