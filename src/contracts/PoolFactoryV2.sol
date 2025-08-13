// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./RoscaPoolV2.sol";
import "./Tree.sol";

contract PoolFactoryV2 {
    address public treeContract;
    address public treeCreator;
    
    event PoolCreated(address indexed pool, address indexed creator, uint256 size, uint256 contribution, uint256 roundDuration, uint256 startTime);

    address[] public allPools;

    constructor(address _treeContract) {
        require(_treeContract != address(0), "tree addr");
        treeContract = _treeContract;
        treeCreator = Tree(_treeContract).top();
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
        
        RoscaPoolV2 newPool = new RoscaPoolV2();
        newPool.initialize(msg.sender, size, contribution, roundDuration, startTime, payoutOrder);
        
        pool = address(newPool);
        allPools.push(pool);
        
        emit PoolCreated(pool, msg.sender, size, contribution, roundDuration, startTime);
    }

    function getPools() external view returns (address[] memory) {
        return allPools;
    }
}
