import hre from "hardhat";
import { IceCreamNFT } from "../typechain";

const { ethers } = hre;

const main = async () => {
  const iceCreamNFT: IceCreamNFT = await ethers.getContract("IceCreamNFT");

  const [deployer] = await ethers.getSigners();
  const allowMintTx = await iceCreamNFT["allowMint(address)"](deployer.address);
  await allowMintTx.wait();

  const mintTx = await iceCreamNFT.mintSVG();
  await mintTx.wait();

  console.log(`IceCreamNFT minted! (tx hash: ${mintTx.hash})`);
};

main()
  .then(() => {
    process.exit();
  })
  .catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });
