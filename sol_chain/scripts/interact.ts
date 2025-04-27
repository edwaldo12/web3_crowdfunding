import { ethers } from 'hardhat';
import 'dotenv/config';
import { CrowdfundingContract, TierStruct } from './type';

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS || '';
  if (!contractAddress) throw new Error('CONTRACT_ADDRESS env var missing');

  const tierIndex = 0;

  const Crowdfunding = await ethers.getContractFactory('Crowdfunding');
  const contract = Crowdfunding.attach(
    contractAddress
  ) as unknown as CrowdfundingContract;

  const [signer] = await ethers.getSigners();
  console.log('Using signer:', await signer.getAddress());

  console.log('Campaign name        :', await contract.name());
  console.log('Campaign description :', await contract.description());
  console.log('Funding goal (wei)   :', (await contract.goal()).toString());
  console.log('Deadline (unix)      :', (await contract.deadline()).toString());
  
  let tier: TierStruct;
  try {
    tier = await contract.tiers(tierIndex);
  } catch {
    console.log(`No tier #${tierIndex}. Add one with addTier() first.`);
    return;
  }

  console.log(
    `Tier ${tierIndex} – name: ${tier.name}, price: ${tier.amount} wei, backers: ${tier.backers}`
  );

  console.log('Sending contribution…');
  const tx = await contract.fund(tierIndex, { value: tier.amount });
  await tx.wait();
  console.log('✅ Contribution mined in tx', tx.hash);

  const balance = await contract.getContractBalance();
  console.log('Contract balance now :', balance.toString(), 'wei');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
