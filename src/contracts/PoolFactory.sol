// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./RoscaPool.sol";
import "./Tree.sol";

contract PoolFactory {
    address public immutable treeContract;
    address public immutable treeCreator;
    event PoolCreated(address indexed pool, address indexed creator, address token, uint256 size, uint256 contribution, uint256 roundDuration, uint256 startTime);

    address[] public allPools;

    constructor(address _treeContract) {
        require(_treeContract != address(0), "tree addr");
        treeContract = _treeContract;
        treeCreator = Tree(_treeContract).top();
    }

    modifier onlyTreeCreator() {
        require(msg.sender == treeCreator, "only tree creator");
        _;
    }

    function createPool(
        address token,
        uint256 size,
        uint256 contribution,
        uint256 roundDuration,
        uint256 startTime,
        address[] calldata payoutOrder
    ) external onlyTreeCreator returns (address pool) {
        require(size >= 2 && size <= 12, "Size out of range");
        require(payoutOrder.length == size, "Order size mismatch");
        RoscaPool newPool = new RoscaPool(msg.sender, token, size, contribution, roundDuration, startTime, payoutOrder);
        pool = address(newPool);
        allPools.push(pool);
        emit PoolCreated(pool, msg.sender, token, size, contribution, roundDuration, startTime);
    }

    function getPools() external view returns (address[] memory) {
        return allPools;
    }
}


