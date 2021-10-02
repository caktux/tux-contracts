// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
// import ethers from "@nomiclabs/hardhat-ethers"

const ONE_ETH = hre.ethers.utils.parseUnits('1', 'ether').toString()
const TWO_ETH = hre.ethers.utils.parseUnits('2', 'ether').toString()
const THREE_ETH = hre.ethers.utils.parseUnits('3', 'ether').toString()
const HALF_ETH = hre.ethers.utils.parseUnits("0.5", 'ether').toString()

const caktux = '0x378BCce7235D53BBc3774BFf8559191F06E6818E'


async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const [
    creator,
    creatorB,
    creatorC,
    creatorD,
    curator,
    curatorB,
    curatorC,
    bidder,
    bidderB,
    bidderC
  ] = await hre.ethers.getSigners();

  const Tux = await hre.ethers.getContractFactory('contracts/Tux.sol:Tux');
  const tux = await Tux.deploy('Tux', 'TUX');
  await tux.deployed();
  console.log("Tux deployed to:", tux.address);

  const Auctions = await hre.ethers.getContractFactory('contracts/Auctions.sol:Auctions');
  const auctions = await Auctions.deploy();
  await auctions.deployed();
  console.log("Auctions deployed to:", auctions.address);

  const Collection = await hre.ethers.getContractFactory('contracts/Collection.sol:Collection');
  const collection = await Collection.deploy('Sweet', 'TUX');
  await collection.deployed();
  console.log("Collection deployed to:", collection.address);

  await auctions.registerTokenContract(collection.address)

  await tux.mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await tux.mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await tux.mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await tux.mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await hre.network.provider.request({ method: 'evm_mine' })

  await tux.connect(creatorB).mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await tux.connect(creatorB).mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await tux.connect(creatorB).mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await tux.connect(creatorB).mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await hre.network.provider.request({ method: 'evm_mine' })

  await tux.connect(creatorC).mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await tux.connect(creatorC).mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await tux.connect(creatorC).mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await tux.connect(creatorC).mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await hre.network.provider.request({ method: 'evm_mine' })

  await tux.connect(creatorD).mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await tux.connect(creatorD).mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await tux.connect(creatorD).mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await tux.connect(creatorD).mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await hre.network.provider.request({ method: 'evm_mine' })

  await tux.connect(creatorC).mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await tux.connect(creatorC).mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await tux.connect(creatorC).mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await tux.connect(creatorC).mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await hre.network.provider.request({ method: 'evm_mine' })

  await tux.connect(creatorD).mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await tux.connect(creatorD).mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await tux.connect(creatorD).mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await tux.connect(creatorD).mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await hre.network.provider.request({ method: 'evm_mine' })

  await collection.mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await collection.mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await collection.mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await collection.mint('bafkreihmmtluvg6i63g6i5kps5tt35adoh34gadfohquablrjasq7gd52q'); // TESTING ONLY
  await hre.network.provider.request({ method: 'evm_mine' })

  await creator.sendTransaction({
    to: caktux,
    value: hre.ethers.utils.parseUnits("100", 'ether')
  })
  await tux.connect(creatorD).transferFrom(await creatorD.getAddress(), caktux, 16)
  await auctions.connect(bidderC).makeOffer(tux.address, 16, ONE_ETH, { value: ONE_ETH })

  await tux.setApprovalForAll(auctions.address, true);
  await tux.connect(creatorB).setApprovalForAll(auctions.address, true);
  await tux.connect(creatorC).setApprovalForAll(auctions.address, true);
  await tux.connect(creatorD).setApprovalForAll(auctions.address, true);

  await hre.network.provider.request({ method: 'evm_mine' })

  tx = await auctions.createHouse(
    'Tux',
    caktux,
    10, // fee
    true, // preApproved
    '' // Metadata hash
  );
  await hre.network.provider.request({ method: 'evm_mine' })

  tx = await auctions.createHouse(
    'Not Rare',
    await curator.getAddress(),
    0, // fee
    true, // preApproved
    '' // Metadata hash
  );
  await hre.network.provider.request({ method: 'evm_mine' })

  tx = await auctions.createHouse(
    'More Rare',
    await curatorB.getAddress(),
    250, // fee
    true, // preApproved
    '' // Metadata hash
  );
  await hre.network.provider.request({ method: 'evm_mine' })

  tx = await auctions.createHouse(
    'So Rare',
    await curatorC.getAddress(),
    500, // fee
    true, // preApproved
    '' // Metadata hash
  );
  await hre.network.provider.request({ method: 'evm_mine' })

  tx = await auctions.createHouse(
    'Too Rare',
    await curatorC.getAddress(),
    100, // fee
    false, // preApproved
    '' // Metadata hash
  );
  await hre.network.provider.request({ method: 'evm_mine' })

  tx = await auctions.createHouse(
    'Very Rare',
    caktux,
    10, // fee
    false, // preApproved
    '' // Metadata hash
  );
  await hre.network.provider.request({ method: 'evm_mine' })

  await auctions.connect(curator).addCreator(2, await creator.getAddress())
  await auctions.connect(curatorB).addCreator(3, await creator.getAddress())
  await auctions.connect(curatorC).addCreator(4, await creator.getAddress())
  await auctions.connect(curator).addCreator(2, await creatorB.getAddress())
  await auctions.connect(curatorB).addCreator(3, await creatorB.getAddress())
  await auctions.connect(curatorB).addCreator(3, await creatorC.getAddress())
  await auctions.connect(curatorC).addCreator(4, await creatorC.getAddress())
  await auctions.connect(curatorC).addCreator(5, await creatorC.getAddress())
  await auctions.connect(curatorC).addCreator(5, await creatorD.getAddress())

  await auctions.connect(curator).addCreator(2, caktux)
  await auctions.connect(curatorB).addCreator(3, caktux)

  await hre.network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [caktux],
  })
  const signer = await hre.ethers.getSigner(caktux)
  await auctions.connect(signer).addCreator(1, await creator.getAddress())
  await auctions.connect(signer).addCreator(1, await creatorB.getAddress())
  await auctions.connect(signer).addCreator(1, await creatorC.getAddress())
  await auctions.connect(signer).addCreator(1, await creatorD.getAddress())
  await auctions.connect(signer).addCreator(6, await creator.getAddress())
  await auctions.connect(signer).addCreator(6, await creatorD.getAddress())
  await hre.network.provider.request({
    method: 'hardhat_stopImpersonatingAccount',
    params: [caktux],
  })
  await hre.network.provider.request({ method: 'evm_mine' })


  await auctions.createAuction(
    tux.address, // tokenContract
    1, // tokenId
    3600, // duration
    ONE_ETH, // reservePrice
    1 // houseId
  );
  await auctions.createAuction(
    tux.address, // tokenContract
    2, // tokenId
    3600, // duration
    TWO_ETH, // reservePrice
    1 // houseId
  );
  await auctions.createAuction(
    tux.address, // tokenContract
    3, // tokenId
    86400, // duration
    ONE_ETH, // reservePrice
    1 // houseId
  );
  await auctions.createAuction(
    tux.address, // tokenContract
    4, // tokenId
    86400, // duration
    TWO_ETH, // reservePrice
    2 // houseId
  );
  await hre.network.provider.request({ method: 'evm_mine' })

  await auctions.connect(creatorB).createAuction(
    tux.address, // tokenContract
    5, // tokenId
    3600, // duration
    HALF_ETH, // reservePrice
    2 // houseId
  );
  await auctions.connect(creatorB).createAuction(
    tux.address, // tokenContract
    6, // tokenId
    3600, // duration
    ONE_ETH, // reservePrice
    2 // houseId
  );
  await auctions.connect(creatorB).createAuction(
    tux.address, // tokenContract
    7, // tokenId
    3600, // duration
    HALF_ETH, // reservePrice
    3 // houseId
  );
  await auctions.connect(creatorB).createAuction(
    tux.address, // tokenContract
    8, // tokenId
    86400, // duration
    ONE_ETH, // reservePrice
    3 // houseId
  );
  await hre.network.provider.request({ method: 'evm_mine' })

  await auctions.connect(creatorC).createAuction(
    tux.address, // tokenContract
    9, // tokenId
    3600, // duration
    ONE_ETH, // reservePrice
    3 // houseId
  );
  await auctions.connect(creatorC).createAuction(
    tux.address, // tokenContract
    10, // tokenId
    3600, // duration
    TWO_ETH, // reservePrice
    3// houseId
  );
  await auctions.connect(creatorC).createAuction(
    tux.address, // tokenContract
    11, // tokenId
    86400, // duration
    ONE_ETH, // reservePrice
    4 // houseId
  );
  await auctions.connect(creatorC).createAuction(
    tux.address, // tokenContract
    12, // tokenId
    86400, // duration
    TWO_ETH, // reservePrice
    4 // houseId
  );
  await hre.network.provider.request({ method: 'evm_mine' })

  await auctions.connect(creatorD).createAuction(
    tux.address, // tokenContract
    13, // tokenId
    3600, // duration
    ONE_ETH, // reservePrice
    5 // houseId
  );
  await hre.network.provider.request({ method: 'evm_mine' })
  await auctions.connect(creatorD).createAuction(
    tux.address, // tokenContract
    14, // tokenId
    3600, // duration
    TWO_ETH, // reservePrice
    6 // houseId
  );
  await hre.network.provider.request({ method: 'evm_mine' })
  await auctions.connect(creatorD).createAuction(
    tux.address, // tokenContract
    15, // tokenId
    3600, // duration
    ONE_ETH, // reservePrice
    0 // houseId
  );
  await hre.network.provider.request({ method: 'evm_mine' })
  // await auctions.connect(creatorD).createAuction(
  //   tux.address, // tokenContract
  //   16, // tokenId
  //   3600, // duration
  //   TWO_ETH, // reservePrice
  //   0 // houseId
  // );
  // await hre.network.provider.request({ method: 'evm_mine' })

  await auctions.connect(creatorC).createAuction(
    tux.address, // tokenContract
    17, // tokenId
    3600, // duration
    ONE_ETH, // reservePrice
    0 // houseId
  );
  await hre.network.provider.request({ method: 'evm_mine' })
  await auctions.connect(creatorC).createAuction(
    tux.address, // tokenContract
    18, // tokenId
    3600, // duration
    TWO_ETH, // reservePrice
    0 // houseId
  );
  await hre.network.provider.request({ method: 'evm_mine' })
  await auctions.connect(creatorC).createAuction(
    tux.address, // tokenContract
    19, // tokenId
    3600, // duration
    ONE_ETH, // reservePrice
    0 // houseId
  );
  await hre.network.provider.request({ method: 'evm_mine' })
  await auctions.connect(creatorC).createAuction(
    tux.address, // tokenContract
    20, // tokenId
    3600, // duration
    TWO_ETH, // reservePrice
    0 // houseId
  );
  await hre.network.provider.request({ method: 'evm_mine' })
  await auctions.connect(creatorD).createAuction(
    tux.address, // tokenContract
    21, // tokenId
    3600, // duration
    ONE_ETH, // reservePrice
    0 // houseId
  );
  await hre.network.provider.request({ method: 'evm_mine' })
  await auctions.connect(creatorD).createAuction(
    tux.address, // tokenContract
    22, // tokenId
    3600, // duration
    TWO_ETH, // reservePrice
    0 // houseId
  );
  await hre.network.provider.request({ method: 'evm_mine' })
  await auctions.connect(creatorD).createAuction(
    tux.address, // tokenContract
    23, // tokenId
    0, // duration
    ONE_ETH, // reservePrice
    0 // houseId
  );
  await hre.network.provider.request({ method: 'evm_mine' })
  await auctions.connect(creatorD).createAuction(
    tux.address, // tokenContract
    24, // tokenId
    0, // duration
    TWO_ETH, // reservePrice
    0 // houseId
  );
  await hre.network.provider.request({ method: 'evm_mine' })

  await hre.network.provider.request({ method: 'evm_mine' })

  await auctions.connect(bidder).createBid(1, ONE_ETH, { value: ONE_ETH })

  await auctions.connect(bidder).createBid(3, TWO_ETH, { value: TWO_ETH })
  await auctions.connect(bidderB).createBid(3, THREE_ETH, { value: THREE_ETH })

  await auctions.connect(bidder).createBid(5, ONE_ETH, { value: ONE_ETH })
  await auctions.connect(bidderC).createBid(5, TWO_ETH, { value: TWO_ETH })

  await auctions.connect(bidder).createBid(6, ONE_ETH, { value: ONE_ETH })
  await auctions.connect(bidderB).createBid(6, THREE_ETH, { value: THREE_ETH })

  await auctions.connect(bidderB).createBid(7, TWO_ETH, { value: TWO_ETH })
  await auctions.connect(bidderC).createBid(7, THREE_ETH, { value: THREE_ETH })

  await auctions.connect(bidderB).createBid(8, TWO_ETH, { value: TWO_ETH })
  await auctions.connect(bidderC).createBid(8, THREE_ETH, { value: THREE_ETH })

  await auctions.connect(bidder).createBid(11, TWO_ETH, { value: TWO_ETH })
  await auctions.connect(bidderC).createBid(11, THREE_ETH, { value: THREE_ETH })

  await auctions.registerTokenContract('0x3b3ee1931dc30c1957379fac9aba94d1c48a5405') // Foundation
  await auctions.registerTokenContract('0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0') // SuperRare
  await auctions.registerTokenContract('0x60f80121c31a0d46b5279700f9df786054aa5ee5') // Rarible
  await auctions.registerTokenContract('0xfbeef911dc5821886e1dda71586d90ed28174b7d') // KO
  await auctions.registerTokenContract('0xfe21b0a8df3308c61cb13df57ae5962c567a668a') // Ephimera
  await auctions.registerTokenContract('0xabEFBc9fD2F806065b4f3C237d4b59D9A97Bcac7') // Zora
  await auctions.registerTokenContract('0x2a46f2ffd99e19a89476e2f62270e0a35bbf0756') // MP
  await auctions.registerTokenContract('0x495f947276749ce646f68ac8c248420045cb7b5e') // OS
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
