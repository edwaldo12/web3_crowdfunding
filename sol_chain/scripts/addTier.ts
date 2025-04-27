import { ethers } from 'hardhat';
import 'dotenv/config';
import { CrowdfundingContract } from './type';

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const tierName = process.env.TIER_NAME || 'Test';
  const tierAmountGwei = process.env.TIER_AMOUNT_GWEI || '0.1';

  if (!contractAddress) {
    throw new Error('CONTRACT_ADDRESS is not set in .env');
  }

  const Crowdfunding = await ethers.getContractFactory('Crowdfunding');
  const contract = Crowdfunding.attach(
    contractAddress
  ) as unknown as CrowdfundingContract;

  const [signer] = await ethers.getSigners();
  console.log('Using signer:', await signer.getAddress());

  const amountInWei = ethers.parseUnits(tierAmountGwei, 'gwei');

  console.log(
    `Adding tier "${tierName}" with amount ${tierAmountGwei} gwei (${amountInWei} wei)...`
  );

  const tx = await contract.addTier(tierName, amountInWei);
  await tx.wait();

  console.log('✅ Tier added successfully!');
}

main().catch((err) => {
  console.error('❌ Error adding tier:', err);
  process.exitCode = 1;
});
