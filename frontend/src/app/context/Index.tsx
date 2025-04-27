'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  BrowserProvider,
  Contract,
  ethers,
  JsonRpcSigner,
  Eip1193Provider,
} from 'ethers';
import CrowdfundingFactory from '@/ABI/CrowdfundingFactory.json';
import type { MetaMaskInpageProvider } from '@metamask/providers';
import { ensureSepolia } from '../utils';
import { WalletCtx } from './type';

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider & Eip1193Provider;
  }
}

const WalletContext = createContext<WalletCtx | undefined>(undefined);

export const WalletProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);

  const factoryAddress =
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    '0xEba34f201fdc8E241376E576D64B6c8a2bb0A49a';

  const connectWallet = useCallback(async () => {
    if (!window?.ethereum) {
      alert('MetaMask is not installed!');
      return;
    }

    try {
      await ensureSepolia(window.ethereum);
    } catch (err) {
      console.error('User rejected network switch →', err);
      return;
    }

    if (provider && signer && account && contract) return;
    try {
      const prov = new ethers.BrowserProvider(window.ethereum);
      await prov.send('eth_requestAccounts', []);
      const sign = await prov.getSigner();
      const addr = await sign.getAddress();

      setProvider(prov);
      setSigner(sign);
      setAccount(addr);
      setContract(
        (prev) =>
          prev ??
          new ethers.Contract(factoryAddress, CrowdfundingFactory.abi, sign)
      );
    } catch (err) {
      console.error('[WalletProvider] connectWallet error →', err);
    }
  }, [account, provider, signer, contract, factoryAddress]);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (!accounts.length) {
      setAccount(null);
      return;
    }
    const newAddr = accounts[0].toLowerCase();
    setAccount((prev) => (prev === newAddr ? prev : newAddr));
  }, []);

  useEffect(() => {
    const { ethereum } = window as typeof window;
    if (!ethereum) return;

    ethereum.on?.(
      'accountsChanged',
      handleAccountsChanged as (...args: unknown[]) => void
    );
    return () => {
      if (ethereum.removeListener) {
        ethereum.removeListener(
          'accountsChanged',
          handleAccountsChanged as (...args: unknown[]) => void
        );
      }
    };
  }, [handleAccountsChanged]);

  return (
    <WalletContext.Provider
      value={{ account, provider, signer, contract, connectWallet }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletCtx => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside <WalletProvider>');
  return ctx;
};
