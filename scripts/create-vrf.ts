import { AutomateSDK, TriggerType } from "@gelatonetwork/automate-sdk";
import hre from "hardhat";
import { IceCreamNFT } from "../typechain";

const { ethers } = hre;

const main = async () => {
  const [deployer] = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId;

  const automate = new AutomateSDK(chainId, deployer);

  const iceCreamNFT: IceCreamNFT = await ethers.getContract("IceCreamNFT");

  // Create task using automate sdk
  console.log("Creating automate task...");

  const { taskId, tx } = await automate.createBatchExecTask({
    name: "Icecream VRF",
    web3FunctionHash: "QmWm8Uq2UYRAVwFyzWop2Hghj56WhJk7K8hGGC2Jy7rzDo",
    web3FunctionArgs: { consumerAddress: iceCreamNFT.address },
    trigger: {
      type: TriggerType.EVENT,
      filter: {
        topics: [[iceCreamNFT.interface.getEventTopic("RequestedRandomness")]],
        address: iceCreamNFT.address,
      },
      blockConfirmations: chainId === 1 ? 1 : 0,
    },
  });

  await tx.wait();
  console.log(`Task created, taskId: ${taskId} (tx hash: ${tx.hash})`);
  console.log(
    `> https://app.gelato.network/functions/task/${taskId}:${chainId}`
  );
};

main()
  .then(() => {
    process.exit();
  })
  .catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });
