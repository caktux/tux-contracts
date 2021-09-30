
import '@typechain/hardhat'
import '@nomiclabs/hardhat-waffle'

import "solidity-coverage"
import "hardhat-gas-reporter"
import "hardhat-abi-exporter"

import { task } from "hardhat/config"

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts)
    console.log(account.address)
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
      gasPrice: 75000000000,
      gasMultiplier: 1.1,
      // mining: {
      //   auto: false,
      //   interval: 1000
      // },
      // forking: {
      //   url: "https://eth-mainnet.alchemyapi.io/v2/Z8JNiWNLZTHZoKDcy3F35IvyMw7CPOM9",
      // }
    },
    mainnet: {
      chainId: 1,
      url: "https://mainnet.infura.io/v3/94d0e160138c4b2b8dda74c503432245",
      // accounts: [privateKey1, privateKey2, ...]
    }
  },
  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100,
      },
    },
  },
  abiExporter: {
    path: './artifacts/prettyABI',
    clear: true,
    flat: true,
    only: [],
    spacing: 2,
    pretty: true,
  },
  gasReporter: {
    currency: 'USD'
  }
}
