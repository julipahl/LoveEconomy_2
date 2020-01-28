
var LoveEconomy = artifacts.require("./LoveEconomy.sol");
var LocalBusiness = artifacts.require("./LocalBusiness.sol");
var DealsToken = artifacts.require("./DealsToken.sol");
var truffleAssert = require('truffle-assertions');

var LoveEconomy_account;
var business_address1;
var business_address2;
var customer_address1;
var customer_address2;
var customer_address3;
var discountCode = "LoveEconomy12345";

var userFee = 1;
var businessFee = 2;
var deal_price = 1


// test that the depoyed account is set as the owner
contract("LoveEconomy", function(accounts) {


    // account variables
    LoveEconomy_account = accounts[0];
    business_address1 = accounts[1];
    business_address2 = accounts[2];
    customer_address1 = accounts[3];
    customer_address2 = accounts[4];
    customer_address3 = accounts[5];

    it("initialize contract deployer as the owner of the contract", function(){
        return LoveEconomy.deployed().then(function(instance){
            return instance.owner();
        }).then(function(owner) {
            assert.equal(owner, LoveEconomy_account);
        })
        })
    });

    // run tests to see that only the LoveEconomy owner can add new businesses
    it("should allow the owner of the contract to add new businesses", function(){
        var LoveEconomyIntance;
        return LoveEconomy.deployed().then(function(instance){
            LoveEconomyIntance = instance;
            return LoveEconomyIntance.addBusiness(business_address1, "TestBusiness", {from: LoveEconomy_account})
        }).then(function(result){
            business_contract_address1 = result.logs[0].args._businessContractAddress;
        }).then(function(){  
            return LoveEconomyIntance.businessCount.call();

        }).then(function(businessCount){
            assert.equal(businessCount.toNumber(), 1, "The business count should be 1")
        })
    });

    it("should only allow the owner of the contract to add new businesses", function(){
        var LoveEconomyInstance;
        return LoveEconomy.deployed().then(function(instance){
            LoveEconomyInstance = instance;
                truffleAssert.reverts(
                    LoveEconomyInstance.addBusiness(business_address2, "TestBusiness_2", {from: business_address1}))
        
        })
        
    });


// test to see whether a second business can be added if the address is different
it("should add a second business and emit businessAdded event if address is different", function() {
    var LoveEconomyInstance;
    return LoveEconomy.deployed().then(function(instance){
    LoveEconomyInstance = instance;
        return LoveEconomyInstance.addBusiness(business_address2, "TestBusiness_2", {from: LoveEconomy_account});         
    }).then(function(result) {
        assert.equal(result.logs.length, 1, "an event should have been triggered");
        assert.equal(result.logs[0].event, "businessAdded", "event should be businessAdded");
        assert.equal(result.logs[0].args._businessName, "TestBusiness_2", "business in event must be TestBusiness_2");
        assert.equal(result.logs[0].args._businessAddress, business_address2, "business in event must be " + business_address2);
        business_contract_address2 = result.logs[0].args._businessContractAddress;
    });
});


// test that no business is added twice
it("should only allow the owner of the contract to add new businesses", function(){
    var LoveEconomyInstance;
    return LoveEconomy.deployed().then(function(instance){
        LoveEconomyInstance = instance;
            truffleAssert.reverts(
                LoveEconomyInstance.addBusiness(business_address1, "TestBusiness", {from: LoveEconomy_account}))
    
    })
    
});

// test that both new businesses are added to AllBusinesses
it("should add both businesses to allBusinesses array", function() {
    var LoveEconomyInstance;
    return LoveEconomy.deployed().then(function(instance){
        LoveEconomyInstance = instance;
        return LoveEconomyInstance.getAllBusinesses();         
    }).then(function(result){
        assert.equal(result[0],business_address1,"First business should be added to allBusinesses array");
        assert.equal(result[1],business_address2,"Second business should be added to allBusinesses array");
    });
});

// the business contract deloyed when a new business is added should have the business address as it's owner
it("should set the owner of the deployed business contract equal to the busines address of the business added", function(){
    var businessContractInstance;
        return LocalBusiness.at(business_contract_address2).then(function(instance){
            businessContractInstance = instance;
            return businessContractInstance.owner();
        }).then(function(owner){
            assert.equal(owner, business_address2, "The contract owner should be the business address");
        });
});

// the love economy contract should allow a new discount code user to be added if correct code is given
// and increment the stcikers sold by 1 (as one gets the disocunt code when buying a sticker)

it("should allow a new discount user to be added and increment the discountCodeCount and userCount", function(){
    var LoveEconomyIntance;
    return LoveEconomy.deployed().then(function(instance){
        LoveEconomyIntance = instance;
        LoveEconomyIntance.addDiscountCodeUser(customer_address1, "User_1", true, web3.utils.keccak256(discountCode))
    }).then(function(){
        return discountCodeCount = LoveEconomyIntance.discountCodeCount.call();
    }).then(function(count){
        assert.equal(count, 1, "The discount user count should be 1");
    }).then(function(){
        return userCount = LoveEconomyIntance.userCount.call();
    }).then(function(userCount){
        assert.equal(userCount, 1, "The discount user count should be 1");
    })
});


// test that it does not add a new user when incorrect discount code is given
it("should not allow user to be added when incorrect code is given", function(){
    var LoveEconomyInstance;
    return LoveEconomy.deployed().then(function(instance){
        LoveEconomyInstance = instance;
            truffleAssert.reverts(
                LoveEconomyInstance.addDiscountCodeUser(customer_address2, "User_2", true, web3.utils.keccak256("1234")))
    
    })
    
});

// test whether add user function works corrects when user chooses to pay in ether instead
it("should allow a new user to be added if enough ether are paid", function(){
    var LoveEconomyIntance;
    return LoveEconomy.deployed().then(function(instance){
        LoveEconomyIntance = instance;
        LoveEconomyIntance.addUser(customer_address2, "User_2", {value: userFee * 10 ** 18})
    }).then(function(){
        return LoveEconomyIntance.userCount.call();
    }).then(function(count){
        assert.equal(count, 2, "The user count should be 2")
    })
});

// it should not allow the user to be added if less than the fee is paid
it("should not allow user to be added when incorrect amount is paid", function(){
    var LoveEconomyInstance;
    return LoveEconomy.deployed().then(function(instance){
        LoveEconomyInstance = instance;
            truffleAssert.reverts(
                LoveEconomyInstance.addUser(customer_address3, "User_3", {value: 0.5 * 10 ** 18}))
    
    })
    
});

// test that both users are added to AllUsers correctly
it("should add both users to allUsers array", function() {
    var LoveEconomyInstance;
    return LoveEconomy.deployed().then(function(instance){
        LoveEconomyInstance = instance;
        return LoveEconomyInstance.getAllUsers();         
    }).then(function(result){
        assert.equal(result[0],customer_address1,"First customer should be added to allUsers array");
        assert.equal(result[1],customer_address2,"Second customer should be added to allUsers array");
    });
});

// tests for the Local_Business contracts

//test that business fee is paid correctly
it("should allow business to change paid status to true if 2 ethers are paid", function(){
    var businessInstance;    

    return LocalBusiness.at(business_contract_address2).then(function(instance){
        businessInstance = instance;
        businessInstance.activateContract({from: business_address2, value: businessFee * 10 * 18});
    }).then(function(){
        return businessInstance.paid();
    }).then(function(paid){
        assert.equal(paid, true, "the paid variable should be changed to true");
    })
});

// should allow business contract 2 to add a new deal to it's contract
// also tests that the deal is correctly added to AllDeals array
it("should allow the business contract owner to add new deals when business fee was paid", function(){
    return LocalBusiness.at(business_contract_address2).then(function(instance){
        businessContractInstance = instance;
        return businessContractInstance.addDeal("testDeal_1", "TwoForOne", 3, deal_price, {from: business_address2});
    }).then(function(result){
        dealContractAddress = result.logs[0].args.tokenContractAddress;
        return businessContractInstance.getAllDeals();
    }).then(function(deals){
        assert.equal(deals[0], dealContractAddress, "the length should be equal to one");
    });
    
});

// only the business can add new deals
// testing with business_address2 contract
it("should only allow the business contract owner to add new deals", function(){
    return LocalBusiness.at(business_contract_address2).then(function(instance){
        businessContractInstance = instance;
            truffleAssert.reverts(
                businessContractInstance.addDeal("testDeal_1", "TwoForOne", 3, 1, {from: business_address1}))
    
    })
    
});

// test that a business who hasnt paid the business fee ether fee cannot be add a new deal
it("should only allow the business to add new deals if business fee is paid", function(){
    return LocalBusiness.at(business_contract_address1).then(function(instance){
        businessContractInstance = instance;
            truffleAssert.reverts(
                businessContractInstance.addDeal("testDeal_1", "TwoForOne", 3, 1, {from: business_address1}))
    
    })
    
});


// test that the correct event is emited when a new deal is added

it("should emit DealCreated event when a new deal is added", function() {
    var businessContractInstance;
    return LocalBusiness.at(business_contract_address2).then(function(instance){
        businessContractInstance = instance;
        return businessContractInstance.addDeal("testDeal_2", "TwoForOne", 3, 1, {from: business_address2});         
    }).then(function(result) {
        assert.equal(result.logs.length, 1, "an event should have been triggered");
        assert.equal(result.logs[0].event, "DealCreated", "event should be businessAdded");
        assert.equal(result.logs[0].args.businessName, "TestBusiness_2", "business in event must be TestBusiness_2");
        assert.equal(result.logs[0].args.businessAddress, business_address2, "business in event must be " + business_address2);
        assert.equal(result.logs[0].args.dealName, "testDeal_2", "business in event must be testDeal_2");
        assert.equal(result.logs[0].args.price, deal_price, "deal in event must have price of 1");
        assert.equal(result.logs[0].args.expiryDate, 3, "deal in event must hav expiry date of 3");
        assert.equal(result.logs[0].args.active, true, "deal in event must be active");

        token_contract_address2 = result.logs[0].args.tokenContractAddress;
    });
});

// Tests on DealToken contract

// test that the correct business contract address is set as businessContractAddress
it("should set businessContractAddress to the business that added the deal", function() {
    var dealsTokenInstance;
    return DealsToken.at(token_contract_address2).then(function(instance) {
        dealsTokenInstance = instance;
        return dealsTokenInstance.businessContractAddress.call();
    }).then(function(result){
        assert.equal(result, business_contract_address2, "the business Contract address should be set to the business that added the deal");
    })
})

// test that an active user can purchase a deal and that it increments the buyers balance by one
it("should allow an active user to purchase a deal", function() {
    var dealsTokenInstance;
    return DealsToken.at(token_contract_address2).then(function(instance) {
        dealsTokenInstance = instance;
        dealsTokenInstance.purchaseDeal({from: customer_address1, value: deal_price});
    }).then(function() {
        return dealsTokenInstance._balanceOf(customer_address1);
    }).then(function(result){
        assert.equal(result, 1, "users balance should be equal to 1")
    }).then(function(){
        return dealsTokenInstance.dealsBought();
    }).then(function(result){
        assert.equal(result, 1, "total number of deals bought should be 1")
    })
})

// test that only active suers can purchase deals
// it("should not allow a non-active user to purchase a deal", function() {
//     var dealsTokenInstance;
//     return DealsToken.at(token_contract_address2).then(function(instance) {
//         dealsTokenInstance = instance;
//         truffleAssert.reverts(dealsTokenInstance.purchaseDeal({from: customer_address3, value: deal_price})) 
//     })
// })

// test that one active user can sell their token to another active user, and that total supply is still 1
it("should allow an active user to sell a deal", function() {
    var dealsTokenInstance;
    return DealsToken.at(token_contract_address2).then(function(instance) {
        dealsTokenInstance = instance;
        dealsTokenInstance.sellToken(1, customer_address2, {from: customer_address1});
    }).then(function() {
        return dealsTokenInstance._balanceOf(customer_address2);
    }).then(function(result){
        assert.equal(result, 1, "users balance should be equal to 1")
    }).then(function(){
        return dealsTokenInstance._balanceOf(customer_address1);
    }).then(function(result){
        assert.equal(result, 0, "sellers balance should now be 0")
    }).then(function(){
        return dealsTokenInstance.totalSupply();
    }).then(function(result){
        assert.equal(result, 1, "total supply should be 1")
    })
})

// test whether the burn deal works once 
it("should burn the token when useDeal function is used", function() {
    return DealsToken.at(token_contract_address2).then(function(instance) {
        dealsTokenInstance = instance;
        dealsTokenInstance.useDeal(customer_address2, {from: business_address2});
    }).then(function() {
        return dealsTokenInstance.totalSupply();
    }).then(function(result){
        assert.equal(result, 0, "total supply should be 0") 
    }).then(function(){
        return dealsTokenInstance.dealsBought();
    }).then(function(result){
        assert.equal(result, 1, "total number of deals bought should still be 1")
    })

})

// ensure that no other address can all the burn deal function
it("should only allow the business address to call the useDeal function", function() {
    var dealsTokenInstance;
    return DealsToken.at(token_contract_address2).then(function(instance) {
        dealsTokenInstance = instance;
        dealsTokenInstance.purchaseDeal({from: customer_address1, value: deal_price});
    }).then(function() {
        return dealsTokenInstance._balanceOf(customer_address1);
    }).then(function(result){
        assert.equal(result, 1, "users balance should be equal to 1")
    }).then(function(){
    return DealsToken.at(token_contract_address2).then(function(instance) {
        dealsTokenInstance = instance;
        truffleAssert.reverts(dealsTokenInstance.useDeal(customer_address1, {from: business_address1})) 
    })

    })
})


