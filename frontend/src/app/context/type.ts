import { Contract, JsonRpcSigner, BrowserProvider } from 'ethers';

export interface WalletCtx {
  account: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  contract: Contract | null;
  connectWallet: () => Promise<void>;
}
