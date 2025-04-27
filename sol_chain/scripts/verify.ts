import { run } from 'hardhat';
import 'dotenv/config';

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    throw new Error('Missing CONTRACT_ADDRESS environment variable');
  }

  // const args = [
  //   process.env.CONSTRUCTOR_ARG1 || 'Fifth Test',
  //   process.env.CONSTRUCTOR_ARG2 || 'This is the fifth test of our contract',
  //   process.env.CONSTRUCTOR_ARG3 || 100,
  //   process.env.CONSTRUCTOR_ARG4 || 1,
  // ];

  // console.log(`🔍 Verifying contract at ${contractAddress} with args:`, args);

  try {
    await run('verify:verify', {
      address: contractAddress,
      // constructorArguments: args,
    });
    console.log('✅ Verification complete!');
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
