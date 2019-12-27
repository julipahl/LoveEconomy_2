pragma solidity >=0.4.21 <0.6.0;

import "./LocalBusiness.sol";

contract LoveEconomy {

 // create object to store local businesses that sign up for the Love Economy

    struct local_business {
        string businessName;
        address businessContractAddress; // not sure whether I need this yet
        bool active;
    }

// add a smart contract that has the details of the deals for the business? maybe the price, two-for-one or discount, expiration date?

// object to store Love Economy user details
    struct user {
        string userName;
        bool discountCodeUsed; // whether the user signed in using a discount code
        bool active;
    }

    address[] public AllUsers;

    address[] public AllBusinesses;

    address public owner; // this will be the LoveEconomy who is the owner of all the contracts
    uint private discountCode; // this will be the discount code at the time of contract deployment -> should be set to private and dynamic
    uint public userFee; // the fee will represent Wei, where the actual value recieved needs to be userFee * 10**18

    uint public userCount; // number of users on the system
    uint public businessCount; // number of local businesses

    uint public discountCodeCount; // number of discount codes used

    mapping(address => local_business) public businessAddresstoDetails; // id based lookup for businesses
    mapping(address => user) public userAddresstoDetails; // id based look up for users



    constructor(uint _discountCode, uint _userFee) public {
        owner = msg.sender;
        discountCode = _discountCode;
        userFee = _userFee;
    }

    // events
    event businessAdded (
        string _businessName,
        address _businessAddress,
        address _businessContractAddress,
        bool _active
    );


    // function to add a new local business to the LoveEconomy
    // make the function private, as we only want this contract to be able to add new businesses

    function addBusiness(address _businessAddress, string memory _businessName) public {
        require(msg.sender == owner, "only the LoveEconomy can add new businesses"); // can only register once viable deal is aggreed upon
        require(businessAddresstoDetails[_businessAddress].active != true, "business already exists");

        // Deploy new business contract
        LocalBusiness newBusinessContract = new LocalBusiness(_businessAddress, _businessName);
        // Store the new contract address
        address businessContractAddress = address(newBusinessContract);
        AllBusinesses.push(_businessAddress);


        businessCount++;
        // update the business details and add to the array
        businessAddresstoDetails[_businessAddress] = local_business(_businessName, businessContractAddress, true);
        emit businessAdded(_businessName, _businessAddress, businessContractAddress, true);
    }

    // new users signing up to platform
    // discount code is a bool: whether one was used or not
    function addDiscountCodeUser(address _userAddress, string memory _userName, bool _discountCodeUsed, uint _discountCode) public {
        require(userAddresstoDetails[_userAddress].active != true, "This customer is already registered");
        require(_discountCode == discountCode, "Not the correct Code"); // check that the correct dicount code was added
        //require(msg.sender == _userAddress, "only the active user can add themselves to the LoveEconomy");

        discountCodeCount++;

        userCount ++;
        userAddresstoDetails[_userAddress] = user(_userName, _discountCodeUsed, true);
        AllUsers.push(_userAddress);
    }

// new user sign up when they do not have a discount code and rather want to pay, need the function to be payable
// unsure as could anyone just use someone elses address and then ether will be subtracted from that address?
    function addUser(address _userAddress, string memory _userName) public payable {
        require(userAddresstoDetails[_userAddress].active != true, "This customer is already registered");
        require(msg.value >= userFee * 10**18, "Not enough ether"); // check that the correct dicount code was added
        //require(msg.sender == _userAddress, "only the active user can add themselves to the LoveEconomy");

        userCount ++;
        userAddresstoDetails[_userAddress] = user(_userName, false, true);
        AllUsers.push(_userAddress);
    }

    // Allow LoveEconomy to activate or deactivate businesses on the platform
    function setActiveFlag(address _businessWalletAddress, bool _active) public {
        require(msg.sender == owner, "Only LoveEconomy can change the active flag of a business.");
        businessAddresstoDetails[_businessWalletAddress].active = _active;
    }

    // function to update the signup value, this can only be called by the LoveEconomy contract owner
    function updateUserFee(uint _newFee) public {
        require(msg.sender == owner, "only the LoveEconomy can change the fee charged to new users");
        userFee = _newFee;
    }

    function getAllBusinesses() public view returns(address[] memory){
        return AllBusinesses;
    }

    function getBusinessDetails(address _businessWalletAddress) public view
        returns (string memory businessName, address businessContractAddress, bool active) {

            return(
            businessAddresstoDetails[_businessWalletAddress].businessName,
            businessAddresstoDetails[_businessWalletAddress].businessContractAddress,
            businessAddresstoDetails[_businessWalletAddress].active
            );

        }

// function used by the business contract to create a require statement that the business has to be active before creating a new product
    function isActive(address _businessWalletAddress) public view returns (bool active) {

        return(businessAddresstoDetails[_businessWalletAddress].active);
    }
    /// be able to add new discount codes by love economy?

    function isUserActive(address _userAddress) public view returns(bool active) {
        return(userAddresstoDetails[_userAddress].active);
    }
}