contract('Idk', function(accounts) {
  it("should pledge & disburse", function() {
    var pledgeId = 12345;
    var deadline = 0;
    var idk = Idk.deployed();
    return idk.deposit({from: accounts[0], value: 10000}).then(function() {
      return idk.getBalance.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance, 10000);
      return idk.pledge(pledgeId, 7000, 0, {from: accounts[0]});
    }).then(function() {
      return idk.getBalance.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance, 3000);
      return idk.disbursePledge(pledgeId, [accounts[1]], [1000], {from: accounts[0]});
    }).then(function() {
      return idk.getBalance.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance, 9000);
      return idk.getBalance.call(accounts[1]);
    }).then(function(balance) {
      assert.equal(balance, 1000);
    }).then(function() {
      var pledge = {};
      return Promise.all([
        idk.getPledgeDeadline.call(pledgeId).then(function(val) { pledge.deadline = val; }),
        idk.getPledgeAmount.call(pledgeId).then(function(val) { pledge.amount = val; }),
        idk.getPledgeDisbursed.call(pledgeId).then(function(val) { pledge.disbursed = val; }),
      ]).then(function() {
        assert.equal(pledge.deadline, deadline);
        assert.equal(pledge.amount, 7000);
        assert.equal(pledge.disbursed, true);
      });
    });
  });
});
