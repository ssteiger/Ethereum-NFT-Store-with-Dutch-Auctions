ViewAuctionM = {
  init: function() {
    console.log('ViewAuctionM init');
    return ViewAuctionM.bindEvents();
  },

  bindEvents: function() {
    $('#viewAuctionModal').on('click', '#buyButton', ViewAuctionM.getCurrentPrice);
  },

  getCurrentPrice: function() {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      let account = accounts[0];
      let auctionId  = parseInt($('#viewAuctionModal .panel-body').data('auction-id'));
      let tokenToBuy = parseInt($('#viewAuctionModal .number-template .number').data('token-id'));

      /*
      console.log(   'account: ' + account);
      console.log( 'auctionId: ' + auctionId);
      console.log('tokenToBuy: ' + tokenToBuy);
      */

      App.contracts.NFTDutchAuction.deployed().then(function(instance) {
        tokenToBuy = parseInt(tokenToBuy);
        return instance.getCurrentPriceByAuctionId(auctionId, {from: account});
      }).then(function(currentPrice) {
        console.log('current price: ' + currentPrice);
        return ViewAuctionM.bid(currentPrice, {from: account});
      }).catch(function(err) {
        console.error(err.message);
      });
    });

  },

  bid: function(price) {
    // get values
    let tokenToBuy = $('#viewAuctionModal .number-template .number').attr('data-token-id');

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      let account = accounts[0];

      App.contracts.NFTDutchAuction.deployed().then(function(instance) {
        tokenToBuy = parseInt(tokenToBuy);
        console.log('calling instance.bid() with price: ' + price);
        // TODO: calculate fixed gas amount
        return instance.bid(tokenToBuy, {value: price, from: account, gas: 250000});
      }).then(function(result) {
        return $('#viewAuctionModal').modal('hide');
      }).catch(function(err) {
        console.error(err.message);
      });
    });

  },
}

$(function() {
  $(window).load(function() {
    ViewAuctionM.init();
  });
});
