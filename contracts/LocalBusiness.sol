pragma solidity >=0.4.21 <0.6.0;

import "./LoveEconomy.sol";
import "./DealsToken.sol";

contract LocalBusiness {

address public owner;
address public LoveEconomyAddress;

LoveEconomy loveEconomy;

string public businessName;

event DealCreated(
    string businessName,
    address businessAddress, // which business contract the deal belongs to
    address tokenContractAddress,
    string dealName,
    uint price,
    uint expiryDate,
    bool active
  );

// supply will not be included as once the business puts up a deal, anyone on the platform should be able to use it, hence no limit should be set
struct Deal {
    string businessName;
    address businessContractAddress;
    address tokenContractAddress; // could be used as the id
    string dealName; // can be two for one or % discount
    string dealDescription;
    uint price;
    uint sold;
    uint expiryDate;
    bool active;
}

// array holding all the deals

address[] public tokenContracts;
mapping (address => Deal) public tokenAddressToDeal;

// set owner of newly created business contract to the business address that created the contract
constructor(address _businessAddress, string memory _businessName) public {
    LoveEconomyAddress = msg.sender; // not too sure whether this is correct
    owner = _businessAddress;
    businessName = _businessName;
    loveEconomy = LoveEconomy(LoveEconomyAddress);
}


function addDeal(string memory _dealName, string memory _dealDescription, uint _expiryDate, uint _price) public returns(address) {
    require(msg.sender == owner, "Only the business contract owner can create new deals");
    require(loveEconomy.isActive(owner) == true, "the business must be active currently");
    // the business that is creating this deal must be active
    require(_price > 0, "price needs to be higher than zero"); //price needs to be more than 0

     // Deploy new token contract
    DealsToken newTokenContract = new DealsToken();
    // Store the new contract address
    address tokenContractAddress = address(newTokenContract);

    tokenContracts.push(tokenContractAddress);

    tokenAddressToDeal[tokenContractAddress] = Deal(businessName,
                                                    address(this),
                                                    tokenContractAddress,
                                                    _dealName,
                                                    _dealDescription,
                                                    _price,
                                                    0,
                                                    _expiryDate,
                                                    true);

    emit DealCreated(businessName, msg.sender, tokenContractAddress, _dealName, _price, _expiryDate, true);
    return(tokenContractAddress);
}

function getDealCount() public view returns(uint){
        return tokenContracts.length;
}

// set a deal to no longer be active

function setDealActiveFlag(address _tokenAddress, bool _active) public view {
        tokenAddressToDeal[_tokenAddress].active == _active;
}

function activeUser(address _userAddress) public view returns(bool) {
    return loveEconomy.isUserActive(_userAddress);
}

// will use the address as an id
function dealPrice(address _tokenAddress) public view returns(uint) {
    return tokenAddressToDeal[_tokenAddress].price;
}

// should not be public, but leaving it for now
function purchaseDeal(address _tokenAddress) public view returns (uint) {
    uint _sold = tokenAddressToDeal[_tokenAddress].sold;
    _sold++;
    return(_sold);
}

function getAllDeals() public view returns(address[] memory){
    return tokenContracts;
}

function getDealDetails(address _tokenAddress) public view
        returns(string memory, string memory, string memory, uint,
                uint, uint, bool) {

            return(
            tokenAddressToDeal[_tokenAddress].businessName,
            tokenAddressToDeal[_tokenAddress].dealName,
            tokenAddressToDeal[_tokenAddress].dealDescription,
            tokenAddressToDeal[_tokenAddress].price,
            tokenAddressToDeal[_tokenAddress].sold,
            tokenAddressToDeal[_tokenAddress].expiryDate,
            tokenAddressToDeal[_tokenAddress].active
            );

        }


}