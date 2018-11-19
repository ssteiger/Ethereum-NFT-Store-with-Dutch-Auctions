App = {
  contracts: {},

  init: function() {
    console.log('App init');

    let from = 0;
    let   to = 100;
    let numberRow = $('#numberRow');
    let numberTemplate = $('#numberTemplate');
    /*
      While some ERC-721 smart contracts may find it convenient to start with ID 0
      and simply increment by one for each new NFT, callers SHALL NOT assume
      that ID numbers have any specific pattern to them, and MUST treat the ID as a "black box".
    */
    for (let i=from; i<=to; i++) {
      // add thousands seperators
      let formattedNumber = i.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      numberTemplate.find('.panel-number').attr('data-token-id', i);
      numberTemplate.find('.btn-avail').attr('data-token-id', i);
      numberTemplate.find('.btn-mint').attr('data-token-id', i);
      numberTemplate.find('.panel-body .number').text(formattedNumber);

      numberRow.append(numberTemplate.html());
    }
    // fit textsize of large numbers
    fitty('#app .number', {
      minSize: 20,
      maxSize: 60
    });

    return App.bindEvents();
  },

  initContracts: function() {
    console.log('initializing contracts');
    $.getJSON('NumbersNFT.json', function(contract) {
      // instantiate truffle-contract with contract data
      App.contracts.NumbersNFT = TruffleContract(contract);
      // set provider for contract
      App.contracts.NumbersNFT.setProvider(window.web3.currentProvider);
    });
    $.getJSON('NFTDutchAuction.json', function(contract) {
      // instantiate truffle-contract with contract data
      App.contracts.NFTDutchAuction = TruffleContract(contract);
      // set provider for contract
      App.contracts.NFTDutchAuction.setProvider(window.web3.currentProvider);
    });
    console.log('contracts:');
    console.log(App.contracts);
  },

  bindEvents: function() {
    // submit range form
    $('#search').submit(function(event) {
      event.preventDefault();
      App.search();
    });
    // check availability of NFT
    $('.btn-avail').click(function(event) {
      event.stopImmediatePropagation();
      App.checkAvailability(event);
    });
    // mint NFT
    $('.btn-mint').click(function(event) {
      event.stopImmediatePropagation();
      App.mintNFT(event);
    });
  },

  search: function() {
    let  from = document.getElementById('from').value;
    let    to = document.getElementById('to').value;
    let range = to - from;
    // stop browser from freezing when showing to many numbers
    if (range < 0) {
      App.displayErrorMessage('Please enter a positive range');
    } else if (range > 300) {
      App.displayErrorMessage('Warning: The amount of numbers you selected is probably to much for your browser');
    } else {
      // remove current numbers displayed
      let numberRow = $('#numberRow');
      numberRow.empty();
      // append numbers in range to the page
      for (let i = from; i <= to; i++) {
        // add thousands seperators
        let formattedNumber = i.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        // get one panel
        let bluePrint = $('.panel-number').parent().clone(true);
        // change the text and attributes of the panel
        bluePrint.find('.panel-number').attr('data-token-id', i);
        bluePrint.find('.panel-body .number').text(formattedNumber);
        bluePrint.find('.btn-avail').attr('data-token-id', i);
        bluePrint.find('.btn-mint').attr('data-token-id', i);
        // append the panel to dom
        numberRow.append(bluePrint[0]);
      }
    }
    // fit textsize of large numbers
    fitty('#numberRow .number', {
      minSize: 20,
      maxSize: 60
    });
  },

  checkAvailability: function(event) {
    event.preventDefault();
    console.log('checkAvailability:');
    let tokenToCheck = parseInt($(event.target).data('token-id'));
    console.log('of NFT ' + tokenToCheck);

    App.contracts.NumbersNFT.deployed().then(function(instance) {
      console.log('tokenToCheck: ' + tokenToCheck);
      return instance.ownerOf(tokenToCheck);
    }).then(function(result) {
      console.log('owner: ' + result);
      console.log('-> NFT ' + tokenToCheck + ' is not available');
      // mark as not available
      App.markAsBought(tokenToCheck);
    }).catch(function(err) {
      // ownerOf() throws if the NFT has no owner
      console.log(err.message);
      console.log('-> NFT ' + tokenToCheck + ' is still available');
      // mark as available
      App.markAsAvailable(tokenToCheck);
    });
  },

  markAsBought: function(number) {
    let selector = $('.panel-number[data-token-id=' + number + ']');
    selector.find('.btn-mint').hide();
    selector.find('.info-available').hide();
    selector.find('.btn-avail').show();
    selector.find('.btn-avail').text('Owned').attr('disabled', true);
  },

  markAsAvailable: function(number) {
    let selector = $('.panel-number[data-token-id=' + number + ']');
    selector.find('.btn-avail').hide();
    selector.find('.info-available').show();
    selector.find('.btn-mint').show();
  },

  mintNFT: function(event) {
    event.preventDefault();

    let tokenToBuy = parseInt($(event.target).data('token-id'));

    window.web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      } else if (accounts.length == 0) {
        // TODO:
        console.log('no accounts found');
        console.log('is metamask unlocked?');
      } else {
        let account = accounts[0];
        console.log('got account: ' + account);
        App.contracts.NumbersNFT.deployed().then(function(contract) {
          console.log('minting NFT ' + tokenToBuy);
          // function _mint(address _to, uint256 _tokenId)
          // TODO: minting is currently only allowed by the owner of the contract
          return contract.mint(account, tokenToBuy, {from: account});
        }).then(function(result) {
          return App.markAsBought(tokenToBuy);
        }).catch(function(err) {
          console.error(err.message);
        });
      }
    });
  },

  displayErrorMessage: function(message) {
    $('#errorMessage').text(message).show();
  },
}

$(function() {
  $(window).load(function() {
    App.init();
  });
});
