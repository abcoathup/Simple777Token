const Simple777Token = artifacts.require('Simple777Token');

require('openzeppelin-test-helpers/configure')({ web3 });

const { singletons } = require('openzeppelin-test-helpers');

module.exports = async function (deployer, network, accounts) {
  if (network === 'development') {
    const erc1820 = await singletons.ERC1820Registry(accounts[0]);
  }

  await deployer.deploy(Simple777Token);
};
