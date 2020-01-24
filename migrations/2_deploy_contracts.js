const LoveEconomy = artifacts.require("./LoveEconomy.sol");

module.exports = function(deployer) {
  deployer.deploy(LoveEconomy,"LoveEconomy12345",1,2);
};
