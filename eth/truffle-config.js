module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*", // Match any network id
      gas: 6000000, // Increase the gas limit
      gasPrice: 20000000000 // Set the gas price (20 Gwei)/ Set the gas price (20 Gwei)
     
    }
  }
};
