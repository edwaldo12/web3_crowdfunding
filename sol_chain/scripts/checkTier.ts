import { ethers } from 'hardhat';
import 'dotenv/config';
import { CrowdfundingContract, TierStruct } from './type';

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS || '';
  if (!contractAddress) throw new Error('CONTRACT_ADDRESS env var missing');

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

  let index = 0;
  while (true) {
    try {
      const tier: TierStruct = await contract.tiers(index);
      console.log(
        `Tier ${index} – name: ${tier.name}, price: ${tier.amount} wei, backers: ${tier.backers}`
      );
      index++;
    } catch {
      break;
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
