# Ethereum NFT-Store with Dutch Auctions [POC]
## Getting up and running

```bash
# install dependencies
$ npm install

# deploy contracts
$ truffle migrate --reset --network ganache

# start app
$ npm run dev
```
(The app is configured to check for a private [Ganache](https://truffleframework.com/ganache) network)

## Used packages
* [Truffle](https://truffleframework.com/truffle)
* [web3.js](https://github.com/ethereum/web3.js/)
* [Chart.js](https://github.com/chartjs/Chart.js)
* [Annotation plugin for Chart.js](https://github.com/chartjs/chartjs-plugin-annotation)
* [Fitty, Snugly text resizing](https://github.com/rikschennink/fitty)

## Used contracts
- [0xcert/ethereum-utils](https://github.com/0xcert/ethereum-utils)
- [0xcert/ethereum-erc721](https://github.com/0xcert/ethereum-erc721)

## Useful links
- [EIP-721](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md)
- [Developing for Ethereum: Getting Started with Ganache](https://www.codementor.io/swader/developing-for-ethereum-getting-started-with-ganache-l6abwh62j)
- [maksimivanov gradient-coin-tutorial-part-2](https://maksimivanov.com/posts/gradient-coin-tutorial-part-2/)
- [Dutch auction](https://en.wikipedia.org/wiki/Dutch_auction)

## Tools
- [MetaMask](https://metamask.io/)
- [Ganache](https://truffleframework.com/ganache)

## Known errors
**Minting does not work**
- Solution:
  Minting is currently only allowed by the owner of the NFT contract.
  Check that the address from which the contracts were deployed matches the
  address from which one calls `mint()`

**Attempting to run transaction which calls a contract function, but recipient address 0x... is not a contract address**
- Solution:
  Delete `.json` files in `build/contracts/` and redeploy contracts

**Nonce of account is not correct**
- Solution:
  Go to MetaMask -> Settings -> scroll to the bottom -> select `Reset Account`

**`bid()` reverts/out of gas**
- Solution:
  Use more gas ;-)

## TODO's
* [ ] add discoverability for auctions to NFTDutchAuction.sol (see: NFTokenEnumerable.sol `function tokenOfOwnerByIndex(address _owner, uint256 _index)`)
* [ ] add possibility to cancel auctions
* [ ] reduce gas cost of NFTDutchAuction.sol functions
* [ ] rework search for numbers: add steps, show min and max, etc.
* [ ] add notifications
* [x] handle non web3 compatible browsers
* [x] update to new MetaMask injection format
* [ ] inventory: when calling getOwnedNFT() do not loop over 0 -> display message "currently no NFT's owned"
* [ ] unify used time units (currently hours and minutes)

## Screenshots
![](https://imgur.com/DRchlDI.png)
![](https://imgur.com/x2wPZEX.png)
![](https://imgur.com/mLVXLO1.png)
![](https://imgur.com/GxSXwMd.png)
![](https://imgur.com/EdxWA3w.png)
