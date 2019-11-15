// Based on https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/test/examples/SimpleToken.test.js
const { expectEvent, singletons, constants, BN, expectRevert } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const Simple777Token = artifacts.require('Simple777Token');
const Simple20Token = artifacts.require('Simple20Token');
const Simple777Recipient = artifacts.require('Simple777Recipient');

contract('Simple777Token', function ([_, registryFunder, creator, operator]) {
  beforeEach(async function () {
    this.erc1820 = await singletons.ERC1820Registry(registryFunder);
    this.token = await Simple777Token.new({ from: creator });    
  });

  it('has a name', async function () {
    (await this.token.name()).should.equal('Simple777Token');
  });

  it('has a symbol', async function () {
    (await this.token.symbol()).should.equal('S7');
  });

  it('assigns the initial total supply to the creator', async function () {
    const totalSupply = await this.token.totalSupply();
    const creatorBalance = await this.token.balanceOf(creator);

    creatorBalance.should.be.bignumber.equal(totalSupply);

    await expectEvent.inConstruction(this.token, 'Transfer', {
      from: ZERO_ADDRESS,
      to: creator,
      value: totalSupply,
    });
  });

  it('allows operator burn', async function () {
    const creatorBalance = await this.token.balanceOf(creator);
    const data = web3.utils.sha3('Simple777Data');
    const operatorData = web3.utils.sha3('Simple777OperatorData');

    await this.token.authorizeOperator(operator, { from: creator });
    await this.token.operatorBurn(creator, creatorBalance, data, operatorData, { from: operator });
    (await this.token.balanceOf(creator)).should.be.bignumber.equal("0");

  });

  it('should allow transfer from an Operator', async function () {
    const amount = new BN(1000);

    await this.token.authorizeOperator(operator, {from: creator});

    const operatorData = web3.utils.sha3('on behalf of the sender');
    const transferData = web3.utils.sha3('my transfer');

    var recipient = await Simple777Recipient.new(this.token.address, { from: creator });

    const receipt = await this.token.operatorSend(creator, recipient.address, amount, transferData, operatorData, { from: operator });

    await expectEvent.inTransaction(receipt.tx, Simple777Recipient, 'DoneStuff', { from: creator, to: recipient.address, amount: amount, userData: transferData, operatorData: operatorData });

    const recipientBalance = await this.token.balanceOf(recipient.address);
    recipientBalance.should.be.bignumber.equal(amount);
  });

  it('should revert when sending 777 tokens to a non 1820 compliant contract, with a "send" ', async function() {
    
    var simple20Token = await Simple20Token.new(1000,{ from: creator });
    const transferData = web3.utils.sha3('my transfer');
    const amount = new BN(10)

    await expectRevert.unspecified(this.token.send(simple20Token.address, amount, transferData, { from: creator }));

  });

  it('should be compatible with ERC20 tokens, with a "transfer"', async function() {
    
    var simple20Token = await Simple20Token.new(1000,{ from: creator });
    const amount = new BN(10)

    const {logs} = await this.token.transfer(simple20Token.address, amount, { from: creator });
    expectEvent.inLogs(logs,'Transfer',{from: creator, to: simple20Token.address, value: amount});

    const endingBalance = await this.token.balanceOf(simple20Token.address)
    endingBalance.should.be.bignumber.equal(amount);

  });

});
