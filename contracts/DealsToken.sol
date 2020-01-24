pragma solidity >=0.4.21 <0.6.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./LocalBusiness.sol";

contract DealsToken is ERC20 {

   address public businessContractAddress;

   address public tokenContractAddress;
   string public dealName;
   uint8 public dealPrice;

   uint24 public dealsBoughtCount;

   LocalBusiness businessContract;

    constructor(string memory _dealName, uint8 _price) public {
        businessContractAddress = msg.sender;
        // since the business contract will deploy the token contract once a deal is created, the msg.sender will be the business contract
        tokenContractAddress = address(this);
        businessContract = LocalBusiness(businessContractAddress);
        dealName = _dealName;
        dealPrice = _price;
    }

    // function to create a new and unique non-fungible token each time a user buys a deal on the platform
    // want to be able to map the token id to specific deal
    function purchaseDeal() public payable {
        require(msg.value >= dealPrice, "price paid should be atleast the price of the deal");
        //require(businessContract.userActiveStatus(msg.sender) == true, "User can only purchase deals if active");

        address _to = msg.sender; // the person calling this function will be the address who should receive the token
        dealsBoughtCount++;
        _mint(_to, 1);
    }

    // need to be able to approve and transfer token id's (if a user wants to sell their deal to another user)
    // not sure how to make the recipient pay?
    function sellToken(uint _amount, address _recipient) public payable {
        require(msg.sender != address(0) && msg.sender != tokenContractAddress, "sender cannot be the zero address or the contract itself");
        //require(businessContract.userActiveStatus(_recipient) == true, "User can only recieve deals if active");

        address _sender = msg.sender;
        _transfer(_sender, _recipient, _amount);
    }

    // function to burn the token if redeemed at the business (possibly done by scanning a QR code?)
    function useDeal(address _account) public {
        require(msg.sender == businessContract.getBusinessAddress(),
            "only the business can burn the token when it accepts the token as payment");

        // burned amount will be 1 token, each time a token owner uses it
        _burn(_account, 1);
    }

    // functions to extract information
    function _dealPrice() public view returns(uint) {
        return dealPrice;
    }

    function _businessContractAddress() public view returns(address) {
        return (businessContractAddress);
    }

      // returns the account balance of another account with address _sender
    function _balanceOf(address _owner) external view returns (uint256){
       return balanceOf(_owner);
    }

    // return the number of deals bought count
    function dealsBought() public view returns(uint) {
        return dealsBoughtCount;
    }

}