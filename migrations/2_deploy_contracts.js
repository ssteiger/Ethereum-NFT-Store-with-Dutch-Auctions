var NumbersNFT = artifacts.require('./tokens/NumbersNFT.sol');
var NFTDutchAuction = artifacts.require('./NFTDutchAuction.sol');

module.exports = function(deployer) {
  // first deploy NumbersNFT
  deployer.deploy(NumbersNFT, 'NumbersNFT', 'NNFT').then(function() {
    // then deploy NFTDutchAuction
    return deployer.deploy(NFTDutchAuction, NumbersNFT.address);
  });
};
