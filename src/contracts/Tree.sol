// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

contract Tree {
    uint256 public Count = 0;

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
    address public top;
    mapping(address => bool) public hasPaidUpliners;

    constructor() public {
        tree[msg.sender] = User(msg.sender, msg.sender);
        top = msg.sender;
    }

    function enter(address _inviter, address _subscription)
        public
        payable
    {
        require(msg.value > 0, "ETH amount must be greater than zero");
        require(
            tree[msg.sender].inviter == address(0),
            "Sender can't already exist in tree"
        );
        require(tree[_inviter].self == _inviter, "Inviter must exist");
        Count++;

        tree[msg.sender] = User(_inviter, msg.sender);

        bool sent = payable(top).send(msg.value);
        require(sent, "Failed to send Ether");

        emit Summary(msg.sender, _inviter, _subscription, Count);
    }

    function pay(address _member) public payable {
        Count++;
        bool sent = payable(_member).send(msg.value);
        require(sent, "Failed to send Ether");

        emit Payments(msg.sender, _member, msg.value, Count);
    }

    function batchPay(address[] memory _members, uint256 amountPerMember) public payable {
        require(!hasPaidUpliners[msg.sender], "You have already paid your upliners");
        uint256 total = _members.length * amountPerMember;
        require(msg.value == total, "Incorrect ETH sent for batch payment");
        for (uint256 i = 0; i < _members.length; i++) {
            payable(_members[i]).transfer(amountPerMember);
            emit Payments(msg.sender, _members[i], amountPerMember, Count + i + 1);
        }
        Count += _members.length;
        hasPaidUpliners[msg.sender] = true;
    }
}