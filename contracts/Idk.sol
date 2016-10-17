pragma solidity ^0.4.2;

contract Idk {
  struct Pledge {
    address from;
    uint deadline;
    uint amount;
    bool disbursed;
  }

  mapping (address => uint) balances;

  mapping (uint => Pledge) pledges;  // Map from sqlite pledgeId to pledge info.

  function deposit() payable {
      balances[msg.sender] += msg.value;
  }

  function withdraw(uint amount) {
      if (balances[msg.sender] < amount || amount == 0)
          throw;
      balances[msg.sender] -= amount;
      if (!msg.sender.send(amount)) throw;
  }

  function pledge(uint pledgeId, uint amount, uint deadline) {
    if (balances[msg.sender] < amount || amount == 0)
        throw;
    if (pledges[pledgeId].amount != 0)
        throw;
    balances[msg.sender] -= amount;
    pledges[pledgeId] = Pledge({from: msg.sender, deadline: deadline, amount: amount, disbursed: false});
  }

  function disbursePledge(uint pledgeId, address[] payTo, uint[] payAmount) {
    // Do checks.
    Pledge pledge = pledges[pledgeId];
    if (now < pledge.deadline)
        throw;
    if (pledge.from != msg.sender)
        throw;
    if (pledge.disbursed)
        throw;
    if (payTo.length != payAmount.length)
        throw;
    uint newBalance = balances[pledge.from] + pledge.amount;
    for (uint i = 0; i < payTo.length; i++) {
        if (payAmount[i] > newBalance) // Can't exceed available funds.
            throw;
        if (payTo[i] == pledge.from) // Sending to self would break logic below.
            throw;
        newBalance -= payAmount[i];
    }

    // Update state.
    pledge.disbursed = true;
    pledges[pledgeId] = pledge;
    for (i = 0; i < payTo.length; i++) {
        balances[payTo[i]] += payAmount[i];
    }
    balances[pledge.from] = newBalance;
  }

	function getBalance(address addr) returns(uint) {
		return balances[addr];
	}
}
