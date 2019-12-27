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
  initWeb3: function() {
    if (typeof wed3 !== "undefined") {
      // if a web3 instance is already provided by MetaMask
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // specify default instance if no web3 is provided
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function () {
    $.getJSON('LoveEconomy.json', function (LoveEconomy) {

         // get the contract artifact file and use it to instantiate a truffle contract abstraction
         App.contracts.LoveEconomy = TruffleContract(LoveEconomy);

         // set the provider for our contract
         App.contracts.LoveEconomy.setProvider(App.web3Provider);

         //update account info
         App.displayAccountInfo();

         return App.render();
    });

    $.getJSON('LocalBusiness.json', function (LocalBusiness) {
         App.contracts.LocalBusiness = TruffleContract(LocalBusiness);
         App.contracts.LocalBusiness.setProvider(App.web3Provider);
    });

    $.getJSON('DealsToken.json', function (DealToken) {
     App.contracts.DealToken = TruffleContract(DealToken);
     App.contracts.DealToken.setProvider(App.web3Provider);
});


  },

// display some contact information
  
displayAccountInfo: function () {
     web3.eth.getCoinbase(function (err, account) {
          // if there is no error
          if (err === null) {
               //set the App object's account variable
               App.account = account;
               // insert the account address in the p-tag with id='account'
               $("#account").html(account);
               // retrieve the balance corresponding to that account
               web3.eth.getBalance(account, function (err, balance) {
                    // if there is no error
                    if (err === null) {
                         // insert the balance in the p-tag with id='accountBalance'
                         $("#accountBalance").html(web3.fromWei(balance, "ether") + " ETH");
                    }
               });
          }
     })
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


},

//adding a new business: only LoveEconomy address can add businesses

addBusiness: function () {
  console.log('Add Business button clicked');
  // get information from the modal
  var _businessName = $('#BusinessName').val();
  var _businessAddress = $('#BusinessAddress').val();

     // if the name is not provided or invalid address was provided
     if ((_businessName.trim() == '') || (web3.isAddress(_businessAddress) != true)) {
          // we cannot add a business
          console.log('Cannot load business because name or address is invalid')
          return false;
     };

  console.log('Adding business (' + _businessName + ') - Please check Metamask');
  App.contracts.LoveEconomy.deployed().then(function(instance) {
       // call the addBusiness function, 
       // passing the business name and the business wallet address
       return instance.addBusiness(_businessAddress, _businessName, {
            from: App.account,
            gas: 5000000
       });
  }).then(function (receipt) {
       console.log(receipt.logs[0].args._businessName + ' added');
       businessContractAddress = receipt.logs[0].args._businessContractAddress;
       console.log('Business contract address: ' + businessContractAddress);
       return businessContractAddress;
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
        if ((_userName.trim() == '') || (web3.isAddress(_userAddress) != true)) {
             // we cannot add a business
             console.log('Cannot load user because name or address is invalid')
             return false;
        };
   
  
     console.log('Adding user (' + _userName + ') - Please check Metamask');
     console.log('your discount bool is ' + _discountBool);
     console.log("Your discount code used is " + _discountCodeUsed);
     App.contracts.LoveEconomy.deployed().then(function(instance) {
          // call the addBusiness function, 
          // passing the business name and the business wallet address
          return instance.addDiscountCodeUser(_userAddress, _userName, _discountBool, _discountCodeUsed, {
               from: App.account,
               gas: 5000000
          });
     }).then(function () {
          console.log(' new user added');
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
        if ((_userName.trim() == '') || (web3.isAddress(_userAddress) != true)) {
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
          console.log(' new user added');
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
     
          App.contracts.LoveEconomy.deployed().then(function(instance) {
               LoveEconomyInstance = instance;
               return LoveEconomyInstance.owner();
          }).then(function(owner){
               if(owner == App.account) {
                    console.log("will display details");
                    LoveEconomyInstance.getAllBusinesses().then(function(businessAddresses) {
                         console.log("there are " + businessAddresses.length + " businesses");
                         businessAddresses.forEach(businessWalletAddress => {
                              return LoveEconomyInstance.getBusinessDetails(businessWalletAddress).then(function(businessDetails){
                                   App.showBusiness(
                                        businessDetails[0],
                                        businessWalletAddress,
                                        businessDetails[1],
                                        businessDetails[2]
                                   );
                              })
                              
                         });
                    });

               } else {
                    console.log("Only Master Account can display businesses not " + App.Account);
               }
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
            if(owner == App.account) {
                 console.log("will display details");
                 console.log("details of " + businessSearch + " will be shown")
                    LoveEconomyInstance.getBusinessDetails(businessSearch).then(function(businessDetails){
                         App.showBusiness(
                              businessDetails[0],
                              businessSearch,
                              businessDetails[1],
                              businessDetails[2]
                         );
                    });
               } else {
                 console.log("Only Master Account can display businesses not " + App.Account);
            }
       })

},

showBusiness: function (name, address, contractAddress, active) {
     var businessName = name;
     var businessWallet = address;
     var businessContract = contractAddress;
     var businessActive = active;
     var businessDetails = $("#businessDetails");
     console.log("the business name is " + name + "wallet address is " + address + "contract address " + contractAddress + "active:" + active)
     // Render candidate Result
     var businessTemplate = "<tr><th>" + businessName + "</th><td>" + businessWallet + "</td><td>" + businessContract + "</td><td>" + businessActive + "</td></tr>"
     businessDetails.append(businessTemplate);
},

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

     _expirationDate = new Date(_currentDate.setMonth(_currentDate.getMonth() + _expirationMonth)); // NOT WORKING

     var _businessContractAddress;
   
        // if the name is not provided or invalid address was provided
        if ((_dealName.trim() == '')) {
             // we cannot add a business
             console.log('Cannot load business because name or address is invalid')
             return false;
        };

   // replaced App.account with web3.eth.accounts[1] for now
     console.log('Adding deal (' + _dealName + ') - Please check Metamask');
     console.log('Adding deal with (' + web3.eth.accounts[1] + ') account');
     console.log("the expiration date is : " + _expirationDate);
     
     App.contracts.LoveEconomy.deployed().then(function(instance) {
          // call the App.account function, 
          // pass the current business address active to add a new deal
          return instance.getBusinessDetails(web3.eth.accounts[1]);
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
          return businessInstance.addDeal(_dealName, _dealDetails, _expirationDate, _price, {
               from: web3.eth.accounts[1],
               gas: 6700000
          });
     }).then(function(result){
          console.log(result.logs[0].args.businessName + ' added');
          console.log(result.logs[0].args.businessAddress + ' added');
          console.log(result.logs[0].args.tokenContractAddress + ' added');
          console.log(result.logs[0].args.dealName + ' added');
          console.log(result.logs[0].args.dealDescription + ' added');
          console.log(result.logs[0].args.price + ' added');
          console.log(result.logs[0].args.expiryDate + ' added');
          console.log(result.logs[0].args.active + ' added');
          dealContractAddress = result.logs[0].args.tokenContractAddress;
          console.log('Deal contract address: ' + dealContractAddress);

          return dealContractAddress;
          // log the error if there is one
     }).catch(function (error) {
          console.log(error);
     });
   
   },

   // displaying all the deals and their details

   displayActiveDeals: function() {
     
     if (App.loading) {
          return;
     };
     App.loading = true;

     
     var LoveEconomyInstance;
     var _businessContractAddress;

          // get current metamask logged in 
       // refresh account info
       App.displayAccountInfo();
  
       App.contracts.LoveEconomy.deployed().then(function(instance) {
            LoveEconomyInstance = instance;

               LoveEconomyInstance.getAllBusinesses().then(function(businessAddresses) {
                    console.log("there are " + businessAddresses.length + " businesses");
                    businessAddresses.forEach(businessWalletAddress => {
                         return LoveEconomyInstance.getBusinessDetails(businessWalletAddress).then(function(businessDetails){
                         
                              if (businessDetails[2] != true) {
                              console.log('This is not an active business. Customer cannot be loaded')
                              } else {

                              _businessContractAddress = businessDetails[1];
                              console.log("the business address is :" + _businessContractAddress);
                              // now get instance of the business contract 
                              App.contracts.LocalBusiness.at(_businessContractAddress).then(function(businessContractInstance){
                                   businessContractInstance.getAllDeals().then(function(dealAddresses) {
                                        console.log("there are " + dealAddresses.length + " deals");
                                        dealAddresses.forEach(dealWalletAddress => {
                                             return businessContractInstance.getDealDetails(dealWalletAddress).then(function(dealDetails){
                                                  App.showDeal(
                                                       dealDetails[0],
                                                       dealDetails[1],
                                                       dealDetails[2],
                                                       dealDetails[3],
                                                       dealDetails[4],
                                                       dealDetails[5],
                                                       dealDetails[6]
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


showDeal: function (ownerName, dealName, dealDescription, price, sold, expiryDate, active) {
     var businessName = ownerName;
     var name = dealName;
     var details = dealDescription;
     var dealPrice = price;
     var numberSold = sold;
     var date = expiryDate;
     var dealActive = active;
     var dealDetails = $("#dealDetailsTable");

     // add date combination here

     console.log("the business name is " + businessName + "the deal name is " + name + 
                    "deal details are " + details  + "number sold " + dealPrice +
                    "the price " + numberSold + "the expiry date is " + date +
                    "active:" + dealActive)
     // Render candidate Result
     var dealTemplate = "<tr><th>" + ownerName + "</th><td>" + dealName + "</td><td>" + dealDescription + 
                              "</td><td>" + price + "</td><td>" + sold + "</td><td>" +  expiryDate + 
                              "</td><td>" + active + "</td></tr>"
     dealDetails.append(dealTemplate);
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


   

  // lite-server: run using 
  // npm run dev

/////////////////////
// User site code //
///////////////////

// displaying product details when page loads

/////////////////
// QR code js //
///////////////


// function to avoid having to type querySelector each time

function select(el) {
     return document.querySelector(el);
   }
   
   let qrcode = select("img");
   let qrtext = select("textarea");
   let qrbutton = select("qrbutton");
   
   qrbutton.addEventListener("click", generateQR);
   
   function generateQR() {
     let size = "1000x1000";
     let data = qrtext.value; // whatever we enter into the text box will generate a qr code with that information
     let baseURL = "http://api.qrserver.com/v1/create-qr-code/"; // what generates the qr code
   
     let url = `${baseURL}?data=${data}&size=${size}`;
     
   
     qrcode.src = url; // this means that everytime the function is run, it will update the image with the new qr code
   
   }
   