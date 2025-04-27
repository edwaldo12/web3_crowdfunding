import { ethers } from 'hardhat';
import 'dotenv/config';

async function main() {
  const CrowdfundingFactoryContract = await ethers.getContractFactory('CrowdfundingFactory');
  const crowdfundingContract = await CrowdfundingFactoryContract.deploy();
  await crowdfundingContract.waitForDeployment();
  const deployedAddress = await crowdfundingContract.getAddress();
  console.log('Crowdfunding Factory deployed to:', deployedAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
