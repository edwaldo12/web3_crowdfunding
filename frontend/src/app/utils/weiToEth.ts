import { ethers } from 'ethers';

export const weiToEth = (v: bigint | string) =>
  parseFloat(ethers.formatEther(v)).toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });

export const fetchEthUsd = async (): Promise<number | null> => {
  try {
    const r = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    );
    const d = await r.json();
    return d?.ethereum?.usd ?? null;
  } catch {
    return null;
  }
};

export const parseEth = (v: string) =>
  ethers.parseEther(v.trim() === '' ? '0' : v);

export const fmtEth = (eth: number, ethUsd: number | null) =>
  ethUsd !== null
    ? `$${(eth * ethUsd).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}`
    : `Ξ${eth}`;
