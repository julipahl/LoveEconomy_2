pragma solidity >=0.4.21 <0.6.0;

import "./LocalBusiness.sol";

contract LoveEconomy {

 // create object to store local businesses that sign up for the Love Economy

    struct local_business {
        string businessName;
        address businessContractAddress; // not sure whether I need this yet
        bool active;
    }

// object to store Love Economy user details
    struct user {
        string userName;
        bool discountCodeUsed; // whether the user signed in using a discount code
        bool active;
    }

    address[] public AllUsers; // array holding all user addresses

    address[] public AllBusinesses; // array holding all business addresses

    address public owner; // this will be the LoveEconomy who is the owner of all the contracts
    bytes32 private discountCodeHashed; // this will be the discount code at the time of contract deployment
    uint8 public userFee; // the fee will represent Wei, where the actual value recieved needs to be userFee * 10**18
    uint8 public businessFee; // the fee that is required to be paid by the business to access the platform

    uint24 public userCount; // number of users on the system
    uint24 public businessCount; // number of local businesses

    uint24 public discountCodeCount; // number of discount codes used

    mapping(address => local_business) public businessAddresstoDetails; // id based lookup for businesses
    mapping(address => user) public userAddresstoDetails; // id based look up for users

    constructor(string memory _discountCode, uint8 _userFee, uint8 _businessFee) public {
        owner = msg.sender;
        discountCodeHashed = keccak256(abi.encodePacked(_discountCode));
        userFee = _userFee;
        businessFee = _businessFee;
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
    function addDiscountCodeUser(address _userAddress, string memory _userName, bool _discountCodeUsed, bytes32 _discountCode) public {
        require(userAddresstoDetails[_userAddress].active != true, "This customer is already registered");
        require(_discountCode == discountCodeHashed, "Not the correct Code");
        // check that the correct dicount code was added

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

        userCount ++;
        userAddresstoDetails[_userAddress] = user(_userName, false, true);
        AllUsers.push(_userAddress);
    }

    // Allow LoveEconomy to activate or deactivate businesses on the platform
        // function setActiveFlag(address _businessWalletAddress, bool _active) public {
        //     require(msg.sender == owner, "Only LoveEconomy can change the active flag of a business.");
        //     businessAddresstoDetails[_businessWalletAddress].active = _active;
        // }

    // function to update the signup value, this can only be called by the LoveEconomy contract owner
    function updateUserFee(uint8 _newFee) public {
        require(msg.sender == owner, "only the LoveEconomy can change the fee charged to new users");
        userFee = _newFee;
    }

    // function to update the signup value for businesses,
    // this can only be called by the LoveEconomy contract owner
    function updateBusinessFee(uint8 _newFee) public {
        require(msg.sender == owner, "only the LoveEconomy can change the fee charged to new businesses");
        businessFee = _newFee;
    }

    // function to call informations and run tests
    function getAllBusinesses() public view returns(address[] memory){
        return AllBusinesses;
    }

    function getAllUsers() public view returns(address[] memory){
        return AllUsers;
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

    // function to recieve ether from the business contracts
    // fallback function
    function() external payable {

    }
}