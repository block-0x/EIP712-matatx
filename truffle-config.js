const path = require("path");
const HDWalletProvider = require('@truffle/hdwallet-provider');
const mnemonic = "";
const infura = "";
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545
    },
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/{infura}`),
      network_id: 4,
      gas: 5500000,
      timeoutBlocks: 200,
      skipDryRun: true,
      from: 'your address'    
    }
  }
};
