import { isMainThread } from "worker_threads";
import { AssertionError } from "assert";

var LoveEconomy = artifacts.require("./LoveEconomy.sol");

// test that the depoyed account is set as the owner
contract("LoveEconomy", function(accounts){

    it("initialize contract deployer as the owner of the contract", function(){
        return LoveEconomy.deployed().then(function(instance){
            return instance.owner();
        }).then(function(owner) {
            assert.equal(owner, accounts[0]);
        })
        })
    });

    it("the owner of the contract can add new businesses", function(){
        return LoveEconomy.deployed().then(function(instance){
            instance.addBusiness(accounts[1], "TestBusiness", { from: accounts[0] })
        })
    })

