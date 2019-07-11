const { singletons, BN } = require('openzeppelin-test-helpers');

const Simple777Token = artifacts.require('Simple777Token');
const Simple777Recipient = artifacts.require('Simple777Recipient');

contract('Simple777Recipient', function ([_, registryFunder, creator, holder]) {
  const data = web3.utils.sha3('777TestData');

  beforeEach(async function () {
    this.erc1820 = await singletons.ERC1820Registry(registryFunder);
    this.token = await Simple777Token.new({ from: creator });
    const amount = new BN(10000);
    await this.token.send(holder, amount, data, { from: creator });
    this.recipient = await Simple777Recipient.new(this.token.address, { from: creator });
  });

  it('sends to a contract from an externally-owned account', async function () {
    const amount = new BN(1000);
    await this.token.send(this.recipient.address, amount, data, { from: holder });

    const recipientBalance = await this.token.balanceOf(this.recipient.address);
    recipientBalance.should.be.bignumber.equal(amount);
  });
});
