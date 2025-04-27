import type { MetaMaskInpageProvider } from '@metamask/providers';
import { AddEthereumChainParameter, ProviderRpcError } from './type';

export const SEPOLIA: AddEthereumChainParameter = {
  chainId: '0xaa36a7',
  chainName: 'Sepolia testnet',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
  rpcUrls: ['https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

function isProviderRpcError(e: unknown): e is ProviderRpcError {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    typeof (e as ProviderRpcError).code === 'number'
  );
}

async function switchOnce(
  ethereum: MetaMaskInpageProvider,
  chainId: string = SEPOLIA.chainId
): Promise<void> {
  await ethereum.request<void>({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId }],
  });
}

export async function ensureSepolia(
  ethereum: MetaMaskInpageProvider | undefined
): Promise<void> {
  if (!ethereum?.request) {
    throw new Error('No EIP-1193 wallet found');
  }

  const current = (
    await ethereum.request<string>({ method: 'eth_chainId' })
  )?.toLowerCase();

  if (current === SEPOLIA.chainId) return;
  try {
    await switchOnce(ethereum);
  } catch (err: unknown) {
    const unknownChain =
      isProviderRpcError(err) &&
      (err.code === 4902 ||
        (err.code === -32603 &&
          /unrecognized chain id/i.test(err.message ?? '')));
    if (!unknownChain) throw err;
    await ethereum.request<void>({
      method: 'wallet_addEthereumChain',
      params: [SEPOLIA],
    });
    await switchOnce(ethereum);
  }
}
