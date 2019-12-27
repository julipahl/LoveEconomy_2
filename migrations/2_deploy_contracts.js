const LoveEconomy = artifacts.require("./LoveEconomy.sol");

module.exports = function(deployer) {
  deployer.deploy(LoveEconomy,12345,1);
};
