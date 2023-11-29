import { AutomateSDK } from "@gelatonetwork/automate-sdk";
import { deployments, getNamedAccounts } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  if (hre.network.name !== "hardhat") {
    console.log(
      `Deploying IceCreamNFT to ${hre.network.name}. Hit ctrl + c to abort`
    );
  }

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  let dedicatedMsgSender;

  if (hre.network.name === "hardhat") {
    dedicatedMsgSender = deployer;
  } else {
    const deployerSigner = await hre.ethers.getSigner(deployer);
    const chainId = (await hre.ethers.provider.getNetwork()).chainId;
    const automateSdk = new AutomateSDK(chainId, deployerSigner);

    const dms = await automateSdk.getDedicatedMsgSender();
    dedicatedMsgSender = dms.address;
  }

  await deploy("IceCreamNFT", {
    from: deployer,
    log: hre.network.name !== "hardhat",
    args: [dedicatedMsgSender],
  });
};

export default func;

func.tags = ["IceCreamNFT"];
