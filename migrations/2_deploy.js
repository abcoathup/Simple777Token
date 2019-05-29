const Simple777Token = artifacts.require('Simple777Token');

require('openzeppelin-test-helpers/configure')({ web3 });

const { singletons } = require('openzeppelin-test-helpers');

module.exports = async function (deployer, network, accounts) {
  if (network === 'development') {
    await singletons.ERC1820Registry(accounts[0]);
  }

  await deployer.deploy(Simple777Token);
};
