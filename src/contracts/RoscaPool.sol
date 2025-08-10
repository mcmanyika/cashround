// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RoscaPool {
    // Basic config
    address public immutable creator;
    uint256 public immutable size;
    uint256 public immutable contribution; // per round per member (in wei)
    uint256 public immutable roundDuration; // seconds
    uint256 public immutable startTime;

    // Members and order
    address[] public payoutOrder; // length == size
    mapping(address => bool) public isMember;

    // Rounds
    uint256 public currentRound; // 0-based
    mapping(uint256 => mapping(address => bool)) public hasContributed;
    mapping(uint256 => uint256) public totalContributed; // by round
    mapping(uint256 => bool) public paid; // payout done per round

    // Reentrancy guard
    uint256 private locked;
    modifier noReentrancy() {
        require(locked == 0, "Reentrancy");
        locked = 1;
        _;
        locked = 0;
    }

    event MemberJoined(address indexed member);
    event Contribution(address indexed member, uint256 indexed round, uint256 amount);
    event Payout(uint256 indexed round, address indexed recipient, uint256 amount);
    event RoundAdvanced(uint256 indexed round);

    constructor(
        address _creator,
        uint256 _size,
        uint256 _contribution,
        uint256 _roundDuration,
        uint256 _startTime,
        address[] memory _payoutOrder
    ) {
        require(_creator != address(0), "bad creator");
        require(_size >= 2 && _size <= 12, "size range");
        require(_payoutOrder.length == _size, "order mismatch");
        creator = _creator;
        size = _size;
        contribution = _contribution;
        roundDuration = _roundDuration;
        startTime = _startTime;
        payoutOrder = _payoutOrder;
        // initialize members map
        for (uint256 i = 0; i < _size; i++) {
            require(_payoutOrder[i] != address(0), "zero member");
            require(!isMember[_payoutOrder[i]], "dup member");
            isMember[_payoutOrder[i]] = true;
            emit MemberJoined(_payoutOrder[i]);
        }
    }

    function poolInfo() external view returns (
        uint256 _size,
        uint256 _contribution,
        uint256 _roundDuration,
        uint256 _startTime,
        uint256 _currentRound,
        address _currentRecipient,
        uint256 _roundEndsAt
    ) {
        _size = size;
        _contribution = contribution;
        _roundDuration = roundDuration;
        _startTime = startTime;
        _currentRound = currentRound;
        _currentRecipient = payoutOrder[currentRound % size];
        _roundEndsAt = startTime + ((currentRound + 1) * roundDuration);
    }

    function getPayoutOrder() external view returns (address[] memory) {
        return payoutOrder;
    }

    function currentRecipient() public view returns (address) {
        return payoutOrder[currentRound % size];
    }

    function roundOpen() public view returns (bool) {
        return block.timestamp >= startTime;
    }

    function contribute() external payable noReentrancy {
        require(roundOpen(), "not started");
        require(isMember[msg.sender], "not member");
        require(!hasContributed[currentRound][msg.sender], "already paid");
        require(msg.value == contribution, "incorrect amount");

        hasContributed[currentRound][msg.sender] = true;
        totalContributed[currentRound] += contribution;
        emit Contribution(msg.sender, currentRound, contribution);
    }

    function triggerPayout() external noReentrancy {
        require(roundOpen(), "not started");
        require(!paid[currentRound], "already paid");
        // All members must contribute exactly once per round
        require(totalContributed[currentRound] == contribution * size, "not fully funded");

        address recipient = currentRecipient();
        uint256 amount = totalContributed[currentRound];

        paid[currentRound] = true;

        // Effects before interaction
        // Payout to recipient
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "payout failed");
        emit Payout(currentRound, recipient, amount);

        // Advance round
        currentRound += 1;
        emit RoundAdvanced(currentRound);
    }

    // Allow contract to receive ETH
    receive() external payable {}
}


