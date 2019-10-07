// Based on https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/test/examples/SimpleToken.test.js
const { expectEvent, singletons, constants } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const Simple777Token = artifacts.require('Simple777Token');

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


});
