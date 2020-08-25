// List of tokens for farming.
let tokens = [
    "ETH",
    "AMPL",
    "YFI",
    "LINK",
    "MKR",
    "LEND",
    "COMP",
    "SNX",
]

let amountsPerPool = {
    "ETH": web3.utils.toBN(250000).mul(web3.utils.toBN(10**18)),
    "AMPL": web3.utils.toBN(250000).mul(web3.utils.toBN(10**18)),
    "YFI": web3.utils.toBN(250000).mul(web3.utils.toBN(10**18)),
    "LINK": web3.utils.toBN(250000).mul(web3.utils.toBN(10**18)),
    "MKR": web3.utils.toBN(250000).mul(web3.utils.toBN(10**18)),
    "LEND": web3.utils.toBN(250000).mul(web3.utils.toBN(10**18)),
    "COMP": web3.utils.toBN(250000).mul(web3.utils.toBN(10**18)),
    "SNX": web3.utils.toBN(250000).mul(web3.utils.toBN(10**18)),
}

let contractName = (name) => `HAM${name}Pool`

module.exports = {
    tokens: tokens,
    amountsPerPool: amountsPerPool,
    contractName: contractName,
}