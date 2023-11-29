import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { before } from "mocha";
import { IceCreamNFT } from "../typechain";
const { deployments } = hre;

describe("IceCreamNFT Tests", function () {
  this.timeout(0);

  let deployer: SignerWithAddress;
  let user: SignerWithAddress;
  let iceCreamNft: IceCreamNFT;

  before(async function () {
    await deployments.fixture();

    [deployer, user] = await ethers.getSigners();

    iceCreamNft = await ethers.getContract("IceCreamNFT");

    await iceCreamNft["allowMint(address,uint256)"](deployer.address, 100);
  });

  it("should request randomness", async () => {
    await expect(iceCreamNft.mintSVG()).to.emit(
      "RequestedRandomness(uint256,bytes)"
    );
  });

  it("should fulfill randomness", async () => {
    const randomness =
      "0x471403f3a8764edd4d39c7748847c07098c05e5a16ed7b083b655dbab9809fae";
    const requestId = 0;
    const timeNow = (await ethers.provider.getBlock("latest")).timestamp;
    const round = Math.floor((timeNow - 1692803367) / 3) + 2;

    const consumerData = ethers.utils.defaultAbiCoder.encode(
      ["address"],
      [deployer.address]
    );
    const data = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "bytes"],
      [requestId, consumerData]
    );
    const dataWithRound = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "bytes"],
      [round, data]
    );

    await iceCreamNft.fulfillRandomness(randomness, dataWithRound);

    expect(await iceCreamNft.ownerOf(0)).to.be.equal(deployer.address);
  });

  it("should revert when non operator fulfills randomness", async () => {
    const randomness =
      "0x471403f3a8764edd4d39c7748847c07098c05e5a16ed7b083b655dbab9809fae";
    const dataWithRound = "0x";

    await expect(
      iceCreamNft.connect(user).fulfillRandomness(randomness, dataWithRound)
    ).to.be.revertedWith("only operator");
  });

  it("should revert when fulfilled with invalid roundId", async () => {
    await iceCreamNft.mintSVG();

    const randomness =
      "0x471403f3a8764edd4d39c7748847c07098c05e5a16ed7b083b655dbab9809fae";
    const requestId = 0;
    const round = 100; // invalid round

    const consumerData = ethers.utils.defaultAbiCoder.encode(
      ["address"],
      [deployer.address]
    );
    const data = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "bytes"],
      [requestId, consumerData]
    );
    const dataWithRound = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "bytes"],
      [round, data]
    );

    await expect(
      iceCreamNft.fulfillRandomness(randomness, dataWithRound)
    ).to.be.revertedWith("request fulfilled or missing");
  });

  it("should revert when request alread fulfilled", async () => {
    const randomness =
      "0x471403f3a8764edd4d39c7748847c07098c05e5a16ed7b083b655dbab9809fae";
    const requestId = 0;
    const timeNow = (await ethers.provider.getBlock("latest")).timestamp;
    const round = Math.floor((timeNow - 1692803367) / 3) + 2;

    const consumerData = ethers.utils.defaultAbiCoder.encode(
      ["address"],
      [user.address] // invalid consumer data
    );
    const data = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "bytes"],
      [requestId, consumerData]
    );
    const dataWithRound = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "bytes"],
      [round, data]
    );

    await expect(
      iceCreamNft.fulfillRandomness(randomness, dataWithRound)
    ).to.be.revertedWith("request fulfilled or missing");
  });

  it("should not fulfill with invalid data", async () => {
    await iceCreamNft.mintSVG();

    const randomness =
      "0x471403f3a8764edd4d39c7748847c07098c05e5a16ed7b083b655dbab9809fae";
    const requestId = 1;
    const timeNow = (await ethers.provider.getBlock("latest")).timestamp;
    const round = Math.floor((timeNow - 1692803367) / 3) + 2;

    const consumerData = ethers.utils.defaultAbiCoder.encode(
      ["address"],
      [user.address] // invalid consumer data
    );
    const data = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "bytes"],
      [requestId, consumerData]
    );
    const dataWithRound = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "bytes"],
      [round, data]
    );

    await expect(
      iceCreamNft.fulfillRandomness(randomness, dataWithRound)
    ).to.not.emit("Transfer(address,address,uint256)"); // mint event
  });

  it("should only allow whitelisted to mint", async () => {
    await expect(iceCreamNft.connect(user).mintSVG()).to.be.revertedWith(
      "mint denied"
    );
  });
});
