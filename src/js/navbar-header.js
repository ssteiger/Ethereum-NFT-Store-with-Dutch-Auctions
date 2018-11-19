window.addEventListener('load', function() {
  web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

    let account = accounts[0];
    // shorten
    account = account.substring(0,8) + '...';

    let element = '<a>Account: ' + account + '</a>'

    $('#connectedAccount').append(element);
  });
});
