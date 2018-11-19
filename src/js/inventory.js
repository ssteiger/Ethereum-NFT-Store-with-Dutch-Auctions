Inventory = {
  init: function() {
    console.log('Inventory init');
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      let account = accounts[0];

      Inventory.appendTokens(account);
    });
  },

  appendTokens: function(account) {
    // get account and load tokens
    App.contracts.NumbersNFT.deployed().then(function(instance) {
      // get the balance (number of NFT's) of the user
      return instance.balanceOf(account);
    }).then(function(o) {
      return o.toNumber();
    }).then(function(balance) {
      // get the i'th NFT of the user
      // starting at 0 -> "_index A counter less than `balanceOf(_owner)`"
      let i = 0;

      let getOwnedNFT = function(i) {
        console.log('calling getOwnedNFT() with i = ' + i);
        App.contracts.NumbersNFT.deployed().then(function(instance) {
          // get all NFT's of the user
          return instance.tokenOfOwnerByIndex(account, i);
        }).then(function(o) {
          let number = o.toNumber();
          console.log('found number ' + number);
          // add thousands seperators
          let formattedNumber = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          // append number to dom
          let accNumberRow = $('#accNumberRow');
          let accNumberTemplate = $('#accNumberTemplate');
          accNumberTemplate.find('.panel-body .number').text(formattedNumber);
          accNumberTemplate.find('.panel-number .number').attr('data-token-id', number);
          accNumberTemplate.find('.panel-number button').attr('data-token-id', number);
          accNumberRow.append(accNumberTemplate.html());
          i++;
          if (i < balance) {
            getOwnedNFT(i);
          }
        }).then(function(o) {
          // fit textsize of large numbers
          fitty('#accNumberRow .number', {
            minSize: 20,
            maxSize: 60
          });
        }).catch(function(err) {
          console.error(err.message);
        });
      };

      getOwnedNFT(i);
    });

    return Inventory.bindEvents();
    //return Inventory.appendAuctions(account);
  },
  /*
  // TODO: this feature is currently on ice because one cannot query all auctions by user address
  //       - possible future implementation by making auctions discoverable
  //       - see tokenOfOwnerByIndex() in ERC721Enumerable.sol

  appendAuctions: function(account) {
    App.contracts.NFTDutchAuction.deployed().then(function(instance) {
      // get all events
      let allEvents = instance.allEvents({fromBlock: 0, toBlock: 'latest'});
      allEvents.get(function(error, data) {
        console.log(data);
        // loop through all events
      });

      return instance;
    }).catch(function(err) {
      console.error(err.message);
    });
    return Inventory.bindEvents();
  },
  */

  bindEvents: function() {
    // add number to sell to modal
    $(document).on('click', '#accNumberRow .init-sell', function(e) {
      let formattedNumber = $(this).parent().parent().find('.number').text();
      let number = $(this).attr('data-token-id');
      // add number to the modal
      $('#createAuctionModal .number').text(formattedNumber);
      $('#createAuctionModal .panel-body .number').attr('data-token-id', number);
      $('#submitAuction').attr('data-token-id', number);
      // reset step progress on modal
      $('#progress ol li > .step-completed').hide();
      $('#progress ol li').removeClass('step-completed');
      $('#submitAuction').text('Allow transfer of NFT');
      // https://getbootstrap.com/docs/4.1/components/modal/
      // when modal is ready
      $('#createAuctionModal').on('shown.bs.modal', function(e) {
        // fit textsize of large numbers in modal
        fitty('#createAuctionModal .number', {
          minSize: 20,
          maxSize: 60
        });
      });
    });
  },

}

$(function() {
  $(window).load(function() {
    Inventory.init();
  });
});
