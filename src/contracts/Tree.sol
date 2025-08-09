// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract Tree {
    uint256 public Count = 0;
    bool private locked;

    struct User {
        address inviter;
        address self;
    }

    event Summary(
        address indexed member,
        address indexed inviter,
        address subscription,
        uint256 Count
    );

    event Payments(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 Count
    );

    mapping(address => User) public tree;
    // Track direct children for each member to enable downline queries
    mapping(address => address[]) public children;
    address public top;
    mapping(address => bool) public hasPaidUpliners;

    modifier noReentrancy() {
        require(!locked, "No reentrancy");
        locked = true;
        _;
        locked = false;
    }

    constructor() {
        tree[msg.sender] = User(msg.sender, msg.sender);
        top = msg.sender;
    }

    function enter(address _inviter, address _subscription)
        public
        payable
        noReentrancy
    {
        require(msg.value > 0, "ETH amount must be greater than zero");
        require(
            tree[msg.sender].inviter == address(0),
            "Sender can't already exist in tree"
        );
        require(tree[_inviter].self == _inviter, "Inviter must exist");

        // Effects: Update state variables
        Count++;
        tree[msg.sender] = User(_inviter, msg.sender);
        // Track downline
        children[_inviter].push(msg.sender);

        // Interaction: External call
        (bool sent, ) = payable(top).call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        emit Summary(msg.sender, _inviter, _subscription, Count);
    }

    // View helper to check if an address has at least two levels of downliners:
    // at least one direct child, and at least one grandchild through any child.
    function hasTwoLevelDownline(address member) external view returns (bool) {
        address[] memory lvl1 = children[member];
        if (lvl1.length == 0) return false;
        for (uint256 i = 0; i < lvl1.length; i++) {
            if (children[lvl1[i]].length > 0) {
                return true;
            }
        }
        return false;
    }

    function pay(address _member)
        public
        payable
        noReentrancy
    {
        // Effects: Update state variables
        Count++;

        // Interaction: External call
        (bool sent, ) = payable(_member).call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        emit Payments(msg.sender, _member, msg.value, Count);
    }

    function batchPay(address[] memory _members, uint256 amountPerMember)
        public
        payable
        noReentrancy
    {
        require(!hasPaidUpliners[msg.sender], "You have already paid your upliners");
        uint256 total = _members.length * amountPerMember;
        require(msg.value == total, "Incorrect ETH sent for batch payment");

        // Effects: Update state variables
        hasPaidUpliners[msg.sender] = true;

        for (uint256 i = 0; i < _members.length; i++) {
            // Interaction: External call
            (bool sent, ) = payable(_members[i]).call{value: amountPerMember}("");
            require(sent, "Failed to send Ether");
            emit Payments(msg.sender, _members[i], amountPerMember, Count + i + 1);
        }

        // Update Count after all interactions
        Count += _members.length;
    }
}