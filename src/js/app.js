const web3_utils = require('web3-utils');
const Web3 = require("web3");

App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  
  // existingLoveEconomyAddress: '0x0',
  // existingLoveEconomyAddress: '0x257D7d25CC9D9C753971D67bb13254f95dee280e',

  
  init: function() {
    return App.initWeb3();
  },

  // initial connection of client side application to local blockchain
//   initWeb3: function() {
//      App.web3Provider = new Web3(Web3.givenProvider || "http://localhost:8545");
//      App.web3Provider = web3

//     return App.initContract();
//   },

initWeb3: function() {
     if (typeof web3 !== 'undefined') {
       // If a web3 instance is already provided by Meta Mask.
       App.web3Provider = web3.currentProvider;
       web3 = new Web3(web3.currentProvider);
     } else {
       // Specify default instance if no web3 instance provided
       App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
       web3 = new Web3(App.web3Provider);
     }
     // // Specify default instance if no web3 instance provided
     // App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
     // web3 = new Web3(App.web3Provider);
     return App.initContract();
   },

  initContract: function () {
    $.getJSON('contracts/LoveEconomy.json', function (LoveEconomy) {

         // get the contract artifact file and use it to instantiate a truffle contract abstraction
         App.contracts.LoveEconomy = TruffleContract(LoveEconomy);

         // set the provider for our contract
         App.contracts.LoveEconomy.setProvider(App.web3Provider);

         //update account info
         //App.displayAccountInfo();

         return App.render();
    });

    $.getJSON('contracts/LocalBusiness.json', function (LocalBusiness) {
         App.contracts.LocalBusiness = TruffleContract(LocalBusiness);
         App.contracts.LocalBusiness.setProvider(App.web3Provider);
    });

    $.getJSON('contracts/DealsToken.json', function (DealsToken) {
     App.contracts.DealsToken = TruffleContract(DealsToken);
     App.contracts.DealsToken.setProvider(App.web3Provider);
});


},

////////////////////
//index site code//
//////////////////

// display some contact information
displayAccountInfo: function () {
     web3.eth.getAccounts(async function(err, account) {
       // if there is no error
       if (err === null) {
         //set the App object's account variable
         let accounts = await web3.eth.accounts;
         console.log("accounts");
         App.account = accounts[0];
         // insert the account address in the p-tag with id='account'
         $("#account").html(App.account);
         // retrieve the balance corresponding to that account
         web3.eth.getBalance(App.account, function(err, balance) {
           // if there is no error
           if (err === null) {
             // insert the balance in the p-tag with id='accountBalance'
             $("#accountBalance").html(web3.utils.fromWei(balance, "ether") + " ETH");
           }
         });
       }
     });
},


render: function() {

     // show total number of businesses

     App.contracts.LoveEconomy.deployed().then(function(instance) {
          return instance.businessCount();
     }).then(function(result){
          console.log(result);
          $("#numberOfBusinesses").html(" " + result);
     }).catch(function(err) {
          console.error(err);
     });

     // show the number of new users that register
     App.contracts.LoveEconomy.deployed().then(function(instance) {
          return instance.userCount();
     }).then(function(result){
          console.log(result);
          $("#numberOfUsers").html(" " + result);
     }).catch(function(err) {
          console.error(err);
     });

     // show number of times that the discount code was used 
     App.contracts.LoveEconomy.deployed().then(function(instance) {
          return instance.discountCodeCount();
     }).then(function(result){
          console.log(result);
          $("#discountCodesUsed").html(" " + result);
     }).catch(function(err) {
          console.error(err);
     });

     App.contracts.LoveEconomy.deployed().then(function(instance) {
          return instance.getBusinessDetails(App.account).then(function(result){
               console.log(result[1]);
               $("#currentBusinessContracts").html(" " + result[1]);
          }).catch(function(err){
               $("#currentBusinessContracts").html("none");
          })
     });

     web3.eth.getAccounts(async function(err, account) {
       // if there is no error
       if (err === null) {
         //set the App object's account variable
         console.log("GOT ACCOUNT");
         console.log(account);
         console.log(web3);
         App.account = account[0];
         // insert the account address in the p-tag with id='account'
         $("#account").html(App.account);
         console.log("SET");
         console.log(App.account);
         // retrieve the balance corresponding to that App.account
         web3.eth.getBalance(App.account, function(err, balance) {
           // if there is no error
           if (err === null) {
             // insert the balance in the p-tag with id='accountBalance'
             $("#accountBalance").html(web3.utils.fromWei(balance, "ether") + " ETH");
           }
         });
       }
       console.log(err);
     });

},

// function to display the ether to be paid to sign upt for the LoveEconomy for businesses
businessFee: function() {
     // show total number of businesses
     App.contracts.LoveEconomy.deployed().then(function(instance) {
          return instance.businessFee();
     }).then(function(result){
          console.log(result);
          $("#businessFeeValue").html(result + " ether");
     }).catch(function(err) {
          console.error(err);
     });
 },

//adding a new business: only LoveEconomy address can add businesses

addBusiness: function () {
  console.log('Add Business button clicked');
  // get information from the modal
  var _businessName = $('#BusinessName').val();
  var _businessAddress = $('#BusinessAddress').val();

     // if the name is not provided or invalid address was provided
     if ((_businessName.trim() == '') || (web3.utils.isAddress(_businessAddress) != true)) {
          // we cannot add a business
          console.log('Cannot load business because name or address is invalid')
          return false;
     };

  console.log('Adding business (' + _businessName + ') - Please check Metamask');
  App.contracts.LoveEconomy.deployed().then(function(instance) {
          // call the addBusiness function, 
          // passing the business name and the business wallet address
        return  instance.addBusiness(_businessAddress, _businessName, {
            from: App.account,
            gas: 5000000
       });

     
  }).then(function (receipt) {
       console.log(receipt.logs[0].args._businessName + ' added');
       businessContractAddress = receipt.logs[0].args._businessContractAddress;
       console.log('Business contract address: ' + businessContractAddress);

      // alert("You have successfully signed up on the LoveEconomy")
  }).then(function () {
          alert("a new business has been added");
  }).catch(function (error) {
       console.log(error);
  });

},


// add new user that uses the dicount code
addDiscountCodeUser: function () {
     console.log('Add User button clicked');
     // get information from the modal
     var _userName = $('#discountCodeUserName').val();
     var _userAddress = $('#discountCodeUserAddress').val();
     var _discountBool;
     var _discountCodeUsed;

     var checkbox = $("#chkDiscountCode");

     if(checkbox.is(':checked')) {
          _discountBool = "true";
          _discountCodeUsed = $('#txtDiscountCode').val();
     } 

     
        // if the name is not provided or invalid address was provided
        if ((_userName.trim() == '') || (web3.utils.isAddress(_userAddress) != true)) {
             // we cannot add a business
             console.log('Cannot load user because name or address is invalid')
             return false;
        };
   
  
     console.log('Adding user (' + _userName + ') - Please check Metamask');
     console.log('your discount bool is ' + _discountBool);
     console.log("Your discount code used is " + String(_discountCodeUsed));

     // console.log("the first address is " + web3.utils.isAddress(_userAddress));
     console.log(web3_utils.soliditySha3("'"+_discountCodeUsed+"'"));

     App.contracts.LoveEconomy.deployed().then(function(instance) {
          // call the addBusiness function, 
          // passing the business name and the business wallet address
          return instance.addDiscountCodeUser(_userAddress, _userName, _discountBool,  web3_utils.soliditySha3(_discountCodeUsed), {
               from: App.account,
               gas: 5000000
          });
     }).then(function () {
          alert('You have successfully signed up on the LoveEconomy');
     }).catch(function (error) {
          console.log(error);
     });
   
   },

   
// function to display the ether to be paid to sign upt for the LoveEconomy
   userFee: function() {
     // show total number of businesses
     App.contracts.LoveEconomy.deployed().then(function(instance) {
          return instance.userFee();
     }).then(function(result){
          console.log(result);
          $("#userFeeValue").html(result + " ether");
     }).catch(function(err) {
          console.error(err);
     });
     },

// function to add user that isn't using a discount code and has to pay the user fee value 

   addUser: function () {
     console.log('Add User button clicked');
     // get information from the modal
     var _userName = $('#UserName').val();
     var _userAddress = $('#UserAddress').val();
     // var _userFee = $("#userFeeValue").val();
     var addUserinstance;

    // console.log('User fee is (' + _userFee + ') - Please check Metamask');

        // if the name is not provided or invalid address was provided
        if ((_userName.trim() == '') || (web3.utils.isAddress(_userAddress) != true)) {
             // we cannot add a business
             console.log('Cannot load user because name or address is invalid')
             return false;
        };

     console.log('Adding user (' + _userName + ') - Please check Metamask');
     
     App.contracts.LoveEconomy.deployed().then(function(instance) {
          addUserinstance = instance;
          // call the addBusiness function, 
          // passing the business name and the business wallet address
          return addUserinstance.userFee().then(function(fee){
          console.log('User fee is (' + fee + ') - Please check Metamask')
               addUserinstance.addUser(_userAddress, _userName, {
                    from: _userAddress,
                    gas: 5000000,
                    value: fee * 10**18,
               });
          })
     }).then(function () {
          // console.log(' new user added');
          alert("You have successfully signed up on the LoveEconomy");
     }).catch(function (error) {
          console.log(error);
     });
   
   },

   // display all businesses if LoveEconomy is logged in 
displayBusinessDetails: function() {
        
          var LoveEconomyInstance;
          // get current metamask logged in 
          // refresh account info
          App.displayAccountInfo();
          var current_address = App.account;
          console.log("current address " + current_address)
     
          App.contracts.LoveEconomy.deployed().then(function(instance) {
               LoveEconomyInstance = instance;
               return LoveEconomyInstance.owner();
          }).then(function(owner){
              // if(owner == current_address) {
                    console.log("will display details");
                    LoveEconomyInstance.getAllBusinesses().then(function(businessAddresses) {
                         console.log("there are " + businessAddresses.length + " businesses");
                         businessAddresses.forEach(businessWalletAddress => {
                              
                              LoveEconomyInstance.getBusinessDetails(businessWalletAddress, {from: current_address}).then(function(businessDetails){
                                   App.showBusiness(
                                        businessDetails[0],
                                        businessWalletAddress,
                                        businessDetails[1],
                                        businessDetails[2]
                                   );
                              })
                              
                         });
                    });


               // } else {
               //      console.log("Only Master Account can display businesses not " + App.Account);
               // }
          })

   },

SearchBusinesses: function() {
     
     var LoveEconomyInstance;
     var businessSearch = $("#ViewBusinessAddress").val();

  // get current metamask logged in 
       // refresh account info
       App.displayAccountInfo();
  
       App.contracts.LoveEconomy.deployed().then(function(instance) {
            LoveEconomyInstance = instance;
            return LoveEconomyInstance.owner();
       }).then(function(owner){
          //  if(owner == App.account) {
                 console.log("will display details");
                 console.log("details of " + businessSearch + " will be shown")
                    LoveEconomyInstance.getBusinessDetails(businessSearch, {from: App.account}).then(function(businessDetails){
                         App.showBusiness(
                              businessDetails[0],
                              businessSearch,
                              businessDetails[1],
                              businessDetails[2]
                         );
                    });
          //      } else {
          //        console.log("Only Master Account can display businesses not " + App.Account);
          //   }
       })

},

showBusiness: function (name, address, contractAddress, active) {
     var businessName = name;
     var businessWallet = address;
     var businessContract = contractAddress;
     var businessActive = active;
     var businessDetails = $("#businessDetails");

     console.log(" the business name is " + name + " wallet address is " + address + " contract address " + contractAddress 
                    + " active:" + active)
     // Render candidate Result
     var businessTemplate = "<tr><th>" + businessName + "</th><td>" + businessWallet + "</td><td>" + businessContract + "</td><td>"
                              + businessActive + "</td></tr>"
     businessDetails.append(businessTemplate);
},

//////////////////////////
//local_deals site code//
////////////////////////

businessPaidStatus: function () {

     $('#deals_loadingGIF').modal({ show: true });

 console.log("checking if business paid status is true or false")
     var businessInstance;
     var businessDetails = $("#displayBusinessStatus");
     var businessContractSearch = $("#businessActivated").val();

          // get current metamask logged in 
       // refresh account info
       App.displayAccountInfo();
  
       App.contracts.LocalBusiness.at(businessContractSearch).then(function(instance) {
               businessInstance = instance;
            
               console.log("will display details");
               
               businessInstance.paid().then(function(paid){
                   if(paid == true){
                    businessDetails.html("the business has paid its fee")
                   } ;
               });
             //  } else {
             //    console.log("Only Master Account can display businesses not " + App.Account);
           //   }

       })
       $('#deals_loadingGIF').modal("hide");
     
},

payFee: function() {
     console.log("paying business fee");

     $('#deals_loadingGIF').modal({ show: true });

     var businessInstance;
     var businessFee;
     var businessDetails = $("#displayBusinessStatus");
     var businessContract = $("#businessActivated").val();

     // get current metamask logged in 
       // refresh account info
      // App.displayAccountInfo();

       App.contracts.LoveEconomy.deployed().then(function(instance) {
          return instance.businessFee({from: App.account});
               }).then(function(fee) {
                    console.log("the fee is " + fee);
                    businessFee = fee; }).then(function() {
          
          App.contracts.LocalBusiness.at(businessContract).then(function(instance) {
               businessInstance = instance;
               
               return businessInstance.paid({from: App.account});
                   
               }).then(function(paid){
                    console.log("this business variable is set to: " + paid)

                    if(paid == false) {

                              businessInstance.activateContract({
                                   from: App.account,
                                   gas: 5000000,
                                   value: businessFee * 10**18}).then(function(){
                                   console.log("you have successfully paid 2 ether to activate your contract");
                                   businessDetails.html("You have successfully paid, please add your first deal");
                         });
                         $('#deals_loadingGIF').modal("hide");
                         

                    } else {
                         console.log("you have already paid the fee");
                         businessDetails.html("this business has paid");
                         $('#deals_loadingGIF').modal("hide");
                    }
               })

          });
               
          
   
},

//0x8be240d6dc65183554440fb4e321e0631cbb0ea2

// adding new deals

addDeal: function () {
     console.log('Add Deal button clicked');
     // get information from the modal
     var _dealName = $('#dealName').val();
     var _dealDetails = $('#dealDetails').val();
     var _expirationMonth = $('#expirationMonth').val();
     var _price = $('#price').val();
     var _expirationDate;

     var _currentDate = new Date();

     _date = new Date(_currentDate.setMonth(_currentDate.getMonth() + _expirationMonth)); // NOT WORKING
     var day = _date.getDate();
     var month = _date.getMonth();
     var year = _date.getFullYear();

     _expirationDate2 = day + "/" + month + "/" + year;

     _expirationDate = _expirationMonth; // doing this for testing for now

     var _businessContractAddress;
   
        // if the name is not provided or invalid address was provided
        if ((_dealName.trim() == '')) {
             // we cannot add a business
             console.log('Cannot load business because name or address is invalid')
             return false;
        };

     console.log('Adding deal (' + _dealName + ') - Please check Metamask');
     console.log('Adding deal with (' + App.account + ') account');
     console.log("the expiration date is : " + _expirationDate2);
     
     App.contracts.LoveEconomy.deployed().then(function(instance) {
          return instance.getBusinessDetails(App.account, {from: App.account});
     }).then(function(businessDetails) {
          
          if (businessDetails[2] != true) {
               console.log('This is not an active business. Customer cannot be loaded')
          } else
               _businessContractAddress = businessDetails[1];
          console.log("the business address is :" + _businessContractAddress);
          // now get instance of the business contract 
          return App.contracts.LocalBusiness.at(_businessContractAddress);
     }).then(function(businessInstance){
          console.log('Adding deal ' + _dealName );
           businessInstance.addDeal(_dealName, _dealDetails, _expirationDate, _price, {
                    from: App.account,
                    gas: 5000000});
      })
     // .then(function(result){
     //      console.log(result.logs[0].args.businessName + ' added');
     //      console.log(result.logs[0].args.businessAddress + ' added');
     //      console.log(result.logs[0].args.tokenContractAddress + ' added');
     //      console.log(result.logs[0].args.dealName + ' added');
     //      console.log(result.logs[0].args.dealDetails + ' added');
     //      console.log(result.logs[0].args.price + ' added');
     //      console.log(result.logs[0].args.expiryDate + ' added');
     //      console.log(result.logs[0].args.active + ' added');
     //      dealContractAddress = result.logs[0].args.tokenContractAddress;
     //      console.log('Deal contract address: ' + dealContractAddress);

     //      return dealContractAddress;
     //      // log the error if there is one

     // })
     .then(function(){
          alert("A new deal has been added");
     }).catch(function (error) {
          console.log(error);
     });
   
   },

   
// displaying product details when page loads

// displaying the number of tokens already sold for a deal
TokenDisplay: function() {
     
// $("#loadingGIF").show();
$('#deals_loadingGIF').modal({ show: true });

var LoveEconomyInstance;
var _businessContractAddress;

var _businessName;

     // get current metamask logged in 
     // refresh account info
App.displayAccountInfo();

App.contracts.LoveEconomy.deployed().then(function(instance) {
     LoveEconomyInstance = instance;

     LoveEconomyInstance.getAllBusinesses({from: App.account}).then(function(businessAddresses) {
          console.log("there are " + businessAddresses.length + " businesses");
          businessAddresses.forEach(businessWalletAddress => {
               return LoveEconomyInstance.getBusinessDetails(businessWalletAddress, {from: App.account}).then(function(businessDetails){
               
                    if (businessDetails[2] != true) {
                    console.log('This is not an active business. Customer cannot be loaded')
                    } else {
                    
                    _businessName = businessDetails[0];
                    _businessContractAddress = businessDetails[1];
                    console.log("the business address is :" + _businessContractAddress);
                    // now get instance of the business contract 
                    App.contracts.LocalBusiness.at(_businessContractAddress).then(function(businessContractInstance){
                         businessContractInstance.getAllDeals({from: App.account}).then(function(dealAddresses) {
                              console.log("there are " + dealAddresses.length + " deals");
                              dealAddresses.forEach(dealContractAddress => {
                                   return businessContractInstance.getDealDetails(dealContractAddress, {from: App.account}).then(function(dealDetails){
                                   
                                        App.showTokenDetails(
                                             _businessName, 
                                             dealDetails[1],
                              
                                             );
                                        })
                                   
                              });
                    })
                         
                    })
                    } 
               });

               
          });
          
          });
          
     })
          
},
                         

showTokenDetails: async function (_businessName, _tokenAddress) {
     var businessName = _businessName;
     var dealContractAddress = _tokenAddress

     console.log("the token address is " + dealContractAddress);

     let dealsSold = await App.contracts.DealsToken.at(dealContractAddress).dealsBought({from: App.account});

     let dealName = await App.contracts.DealsToken.at(dealContractAddress).dealName.call();
     
     var tokenDetails = $("#tokenDetails");
     

     // add date combination here

     console.log("the business name is " + businessName + "the deal name is " + dealName + 
                    "deals sold " + dealsSold)
     // Render candidate Result
     var tokenTemplate = "<tr><th>" + businessName + "</th><td>" + dealName + "</td><td>" + dealsSold + "</td></tr>"
                         // the above line sets the id of the button as the function input when the button is pressed.
     tokenDetails.append(tokenTemplate);

     $('#deals_loadingGIF').modal("hide");
},

    /////////////////////
   // User site code //
  ////////////////////

   // displaying all the deals and their details

displayActiveDeals: async function() {

if (App.loading) {
     return;
};
App.loading = true;

$('#token_loadingGIF').modal({ show: true });

var LoveEconomyInstance;
var _businessContractAddress;
var exchangeRate = await App.ETHtoZAR();
console.log("the exchange rate is currently: " + exchangeRate);

     // get current metamask logged in 
     // refresh account info
     App.displayAccountInfo();

     App.contracts.LoveEconomy.deployed().then(function(instance) {
          LoveEconomyInstance = instance;

          LoveEconomyInstance.getAllBusinesses().then(function(businessAddresses) {
               console.log("there are " + businessAddresses.length + " businesses");
               businessAddresses.forEach(businessWalletAddress => {
                    return LoveEconomyInstance.getBusinessDetails(businessWalletAddress, {from: App.account}).then(function(businessDetails){
                    
                         if (businessDetails[2] != true) {
                         console.log('This is not an active business. Customer cannot be loaded')
                         } else {

                         _businessContractAddress = businessDetails[1];
                         console.log("the business address is :" + _businessContractAddress);
                         // now get instance of the business contract 
                         App.contracts.LocalBusiness.at(_businessContractAddress).then(function(businessContractInstance){
                              businessContractInstance.getAllDeals({from: App.account}).then(function(dealAddresses) {
                                   console.log("there are " + dealAddresses.length + " deals");
                                   dealAddresses.forEach(dealContractAddress => {
                                        
                                   return businessContractInstance.getDealDetails(dealContractAddress, {from: App.account}).then(function(dealDetails){
                                        App.showDeal(
                                             dealDetails[0],
                                             dealDetails[2],
                                             dealDetails[3],
                                             dealDetails[4],
                                             dealDetails[5],
                                             dealDetails[1],
                                             exchangeRate
                                        );
                                   })
                                   
                              });
                    })
                         
                    })
                    } 
                    
               });
          });

          });
     })
},


showDeal: function (ownerName, dealName, dealDetails, price, expiryDate, tokenAddress, exchangeRate) {
     var businessName = ownerName;
     var name = dealName;
     var details = dealDetails;
     var dealPrice = price;
     var date = expiryDate;
     var dealDetailsTable = $("#dealDetailsTable");
     var ZARprice = price * exchangeRate;
     var tokenContractAddress = tokenAddress;

     // add date combination here

     console.log("the business name is " + businessName + "the deal name is " + name + 
                    "deal details are " + details + "the deal price is " + dealPrice + "the expiry date is " + date +
                    "the token contract adddress is: " + tokenContractAddress)
     // Render candidate Result
     var dealTemplate = "<tr><th>" + ownerName + "</th><td>" + dealName + "</td><td>" + dealDetails + 
                         "</td><td>" + price + "</td><td>" + ZARprice + 
                         "</td><td>" +  expiryDate + 
                         "</td><td>" + 
                         "<button type='button' id = " + tokenContractAddress + " onclick='App.BuyThisItem(this.id)' >Buy</button>" + "</td></tr>"
                         // the above line sets the id of the button as the function input when the button is pressed.
     dealDetailsTable.append(dealTemplate);

     $('#token_loadingGIF').modal("hide");
},

// return ETH to rand exchange rate function 
// get currency exchange 
   
currencyConverter: async function () {

     const ETHexchange = await App.ETHtoZAR();
     console.log(ETHexchange);
     document.getElementById("ZARrate").innerHTML = "1 ETH = " + ETHexchange + " Rand";
         
},

ETHtoZAR: async function() {
     
     var getFullURL = function(url, options){
          const params = [];
          for (let key in options) {
              params.push(`${key}=${options[key]}`);
          }
          return url + '?' + params.join("&");
      }
      
      var apiKey = "048784013e3c60bcdeadec8128a13f600a84fc9f9d0840007a49edcb4af6020d";
      var baseUrl = "https://min-api.cryptocompare.com/data/price"
      
      var options = {
          api_key: apiKey,
          fsym: "ETH",
          tsyms: "ZAR"
      };
      
      var fullURL = getFullURL(baseUrl, options);
     
      
      const response = await axios.get(fullURL);
      const object = await response.data;

      const ETH = await object.ZAR;
     
      console.log(ETH);
     return(ETH);
   
},


// error as there is a require function for the buyer to be a active user : check that this works
BuyThisItem: function (tokenContractAddress) {
     var _tokenAddress = tokenContractAddress;
     var buyDealInstance;

     console.log("the token address is: " + tokenContractAddress)
          // get current metamask logged in 
       // refresh account info
       App.displayAccountInfo();

     //    // if the name is not provided or invalid address was provided
     //    if ((web3.utils.isAddress(App.account) != true)) {
     //         // we cannot add a business
     //         console.log('Cannot load user because name or address is invalid')
     //         return false;
     //    };

     console.log('Purchasing deal (' + _tokenAddress + ') - Please check Metamask');
   
     App.contracts.DealsToken.at(_tokenAddress).then(function(instance) {
          buyDealInstance = instance;

          return buyDealInstance._dealPrice({from: App.account}).then(function(_dealprice) {
               console.log("the deal price is " + _dealprice);
               buyDealInstance.purchaseDeal({
                    from: App.account, // this needs to be the users account, as only active users can pruchase tokens
                    gas: 5000000,
                    value: _dealprice * 10**18,
               });
          })

     }).then(function() {
          console.log('new deal purchased');
          // alert("You have just purchased a new deal!"); 
     }).catch(function(error) {
          console.log(error);
     });

},



};

// initialize the app everytime the window loads
$(function() {
     $(window).load(function() {
       App.init();
     });
   });

// show and hide checkbox in User sign-up
   $(function() {
  
     // Get the form fields and hidden div
     var checkbox = $("#chkDiscountCode");
     var hidden = $("#dvDiscountCode");
   
     hidden.hide();
   
     checkbox.change(function() {
   
       if (checkbox.is(':checked')) {
         // Show the hidden fields.
         hidden.show();
         console.log("check box was clicked")
   
       } else {
         // Make sure that the hidden fields are indeed
         // hidden.
         hidden.hide();
   
       }
     });
   });

  
  // npm run dev


