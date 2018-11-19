module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // match any network id
      from: '0x21a55041a73814cd92d96530a2fa8aaf6a356fb7', // account address from which to deploy
      gas: 4000000,
    }
  }
};
