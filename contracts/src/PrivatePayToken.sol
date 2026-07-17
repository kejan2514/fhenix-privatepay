// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";

/// @title PrivatePay confidential test token
/// @notice Balances and transfer amounts remain encrypted through CoFHE.
/// @dev Testnet demonstration contract; not audited for production use.
contract PrivatePayToken {
    string public constant name = "Confidential USD";
    string public constant symbol = "cUSD";
    uint8 public constant decimals = 2;
    uint64 public constant FAUCET_AMOUNT = 100_000; // 1,000.00 cUSD
    uint256 public constant FAUCET_COOLDOWN = 1 days;

    mapping(address account => euint64 balance) private encryptedBalances;
    mapping(address account => bool initialized) private hasBalance;
    mapping(address account => uint256 claimedAt) public lastFaucetClaim;

    event FaucetClaimed(address indexed account);
    event ConfidentialTransfer(address indexed from, address indexed to);

    function claimFromFaucet() external {
        require(
            lastFaucetClaim[msg.sender] == 0 ||
                block.timestamp >= lastFaucetClaim[msg.sender] + FAUCET_COOLDOWN,
            "Faucet cooldown active"
        );

        euint64 amount = FHE.asEuint64(FAUCET_AMOUNT);
        if (hasBalance[msg.sender]) {
            encryptedBalances[msg.sender] = FHE.add(encryptedBalances[msg.sender], amount);
        } else {
            encryptedBalances[msg.sender] = amount;
            hasBalance[msg.sender] = true;
        }

        _allowBalance(msg.sender);
        lastFaucetClaim[msg.sender] = block.timestamp;
        emit FaucetClaimed(msg.sender);
    }

    /// @notice Transfers an encrypted amount. If funds are insufficient, zero is moved.
    /// @dev The conditional is evaluated over ciphertext and does not reveal the result.
    function confidentialTransfer(address recipient, InEuint64 calldata encryptedAmount) external {
        require(recipient != address(0), "Invalid recipient");
        require(hasBalance[msg.sender], "Claim faucet funds first");

        euint64 amount = FHE.asEuint64(encryptedAmount);
        euint64 zero = FHE.asEuint64(0);
        ebool enoughFunds = FHE.gte(encryptedBalances[msg.sender], amount);
        euint64 debit = FHE.select(enoughFunds, amount, zero);

        encryptedBalances[msg.sender] = FHE.sub(encryptedBalances[msg.sender], debit);
        if (hasBalance[recipient]) {
            encryptedBalances[recipient] = FHE.add(encryptedBalances[recipient], debit);
        } else {
            encryptedBalances[recipient] = debit;
            hasBalance[recipient] = true;
        }

        _allowBalance(msg.sender);
        _allowBalance(recipient);
        emit ConfidentialTransfer(msg.sender, recipient);
    }

    function encryptedBalanceOf(address account) external view returns (euint64) {
        require(msg.sender == account, "Only balance owner");
        require(hasBalance[account], "Balance not initialized");
        return encryptedBalances[account];
    }

    function _allowBalance(address account) private {
        FHE.allowThis(encryptedBalances[account]);
        FHE.allow(encryptedBalances[account], account);
    }
}
