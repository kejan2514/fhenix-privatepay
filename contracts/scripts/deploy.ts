import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying PrivatePayToken with ${deployer.address}`);
  const factory = await hre.ethers.getContractFactory("PrivatePayToken");
  const token = await factory.deploy();
  await token.waitForDeployment();
  console.log(`PrivatePayToken deployed to ${await token.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
