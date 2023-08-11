require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/TNF_SEJs0uikp8OT1BgH7pWYFXP3kM4E",
      accounts: [
        "4269ea2b504aba06b0813701a9916533a808cbe7a691e6424f85aeb7de95cc61",
      ],
    },
  },
};
