// ============ Contracts ============

import { tokens, contractName, amountsPerPool } from 'tokens.js';

// Protocol
// deployed second
const HAMImplementation = artifacts.require("HAMDelegate");
const HAMProxy = artifacts.require("HAMDelegator");

// deployed third
const HAMReserves = artifacts.require("HAMReserves");
const HAMRebaser = artifacts.require("HAMRebaser");

const Gov = artifacts.require("GovernorAlpha");
const Timelock = artifacts.require("Timelock");

// Deployed fourth.
let contractArtifacts = tokens.map((tokenName) => artifacts.require(contractName(tokenName)))

// deployed fifth
const HAMIncentivizer = artifacts.require("HAMIncentivizer");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    // deployTestContracts(deployer, network),
    deployDistribution(deployer, network, accounts),
    // deploySecondLayer(deployer, network)
  ]);
}

module.exports = migration;

// ============ Deploy Functions ============


async function deployDistribution(deployer, network, accounts) {
  console.log(network)
  let ham = await HAMProxy.deployed();
  let yReserves = await HAMReserves.deployed()
  let yRebaser = await HAMRebaser.deployed()
  let tl = await Timelock.deployed();
  let gov = await Gov.deployed();
  if (network != "test") {
    await Promise.all([
      ...contractArtifacts.map(async (contract) => {
        await deployer.deploy(contract);
      }),
      await deployer.deploy(HAMIncentivizer),
    ]
  );

    let poolContracts = contractArtifacts.map(artifact => new web3.eth.Contract(artifact.abi, artifact.address))
    poolContracts = Object.assign(poolContracts, tokens)

    let ycrv_pool = new web3.eth.Contract(HAMIncentivizer.abi, HAMIncentivizer.address);

    console.log("setting distributor");
    await Promise.all([
        ...Object.values(poolContracts).map(contract => contract.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000})),
        ycrv_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
    ]);

    let two_fifty = web3.utils.toBN(10**3).mul(web3.utils.toBN(10**18)).mul(web3.utils.toBN(250));
    let one_five = two_fifty.mul(web3.utils.toBN(6));

    console.log("transfering and notifying");
    console.log("eth");
    await Promise.all(
        [
            ...tokens.map((tokenName) => ham.transfer(poolContracts[tokenName].address, amountsPerPool[tokenName].toString())),
            ham._setIncentivizer(HAMIncentivizer.address),
        ],
    );

    await Promise.all([
      ...tokens.map((tokenName) => poolContracts[tokenName].methods.notifyRewardAmount(amountsPerPool[tokenName].toString()).send({from:accounts[0]})),
      // incentives is a minter and prepopulates itself.
      ycrv_pool.methods.notifyRewardAmount("0").send({from: accounts[0], gas: 500000}),
    ]);

    await Promise.all([
      ...Object.values(poolContracts).map(contract => contract.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000})),
      ycrv_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
    ]);
    await Promise.all([
      ...Object.values(poolContracts).map(contract => contract.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000})),
      ycrv_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
    ]);
  }

  await Promise.all([
    ham._setPendingGov(Timelock.address),
    yReserves._setPendingGov(Timelock.address),
    yRebaser._setPendingGov(Timelock.address),
  ]);

  await Promise.all([
      tl.executeTransaction(
        HAMProxy.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),

      tl.executeTransaction(
        HAMReserves.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),

      tl.executeTransaction(
        HAMRebaser.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),
  ]);
  await tl.setPendingAdmin(Gov.address);
  await gov.__acceptAdmin();
  await gov.__abdicate();
}
