import { ethers } from 'hardhat';
import 'dotenv/config';

async function main() {
  const CrowdfundingContract = await ethers.getContractFactory('Crowdfunding');
  const crowdfundingContract = await CrowdfundingContract.deploy(
    process.env.WALLET_ADDRESS || '',
    'Fifth Test',
    'This is the fifth test of our contract',
    100,
    1
  );
  await crowdfundingContract.waitForDeployment();
  const deployedAddress = await crowdfundingContract.getAddress();
  console.log('Crowdfunding deployed to:', deployedAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
