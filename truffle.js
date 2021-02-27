module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "5777", // match any network id
      from: "0xED36deb2ffeb19c415221fA1dbB4108C0dd962e4", // account address from which to deploy
      gas: 6721975,
    }
  },
  compilers: {
    solc: {
      version: "0.4.24"
    }
  }
};
