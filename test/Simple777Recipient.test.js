const { accounts, contract, web3 } = require('@openzeppelin/test-environment');

const { expect } = require('chai');
require('chai').should();

const { singletons, BN, expectEvent } = require('@openzeppelin/test-helpers');

const Simple777Token = contract.fromArtifact('Simple777Token');
const Simple777Recipient = contract.fromArtifact('Simple777Recipient');

describe('Simple777Recipient', function () {
  const [registryFunder, creator, holder] = accounts;

  const data = web3.utils.sha3('777TestData');

  beforeEach(async function () {
    this.timeout(3000);
    this.erc1820 = await singletons.ERC1820Registry(registryFunder);
    this.token = await Simple777Token.new({ from: creator });
    const amount = new BN(10000);
    await this.token.send(holder, amount, data, { from: creator });
    this.recipient = await Simple777Recipient.new(this.token.address, { from: creator });
  });

  it('sends to a contract from an externally-owned account', async function () {
    const amount = new BN(1000);
    const receipt = await this.token.send(this.recipient.address, amount, data, { from: holder });

    await expectEvent.inTransaction(receipt.tx, Simple777Recipient, 'DoneStuff', { from: holder, to: this.recipient.address, amount: amount, userData: data, operatorData: null });

    const recipientBalance = await this.token.balanceOf(this.recipient.address);
    recipientBalance.should.be.bignumber.equal(amount);
  });
});
