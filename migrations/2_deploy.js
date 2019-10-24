const Simple777Token = artifacts.require('Simple777Token');
const Simple777Recipient = artifacts.require('Simple777Recipient');

require('@openzeppelin/test-helpers/configure')({ provider: web3.currentProvider, environment: 'truffle' });

const { singletons } = require('@openzeppelin/test-helpers');

module.exports = async function (deployer, network, accounts) {
  if (network === 'development') {
    // In a test environment an ERC777 token requires deploying an ERC1820 registry
    await singletons.ERC1820Registry(accounts[0]);
  }

  await deployer.deploy(Simple777Token);
  const token = await Simple777Token.deployed();

  await deployer.deploy(Simple777Recipient, token.address);
};
