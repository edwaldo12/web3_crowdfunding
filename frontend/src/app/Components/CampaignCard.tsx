'use client';

import Link from 'next/link';
import { Contract } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { useWallet } from '@/app/context/Index';
import CrowdfundingABI from '@/ABI/Crowdfunding.json';
import { weiToEth } from '../utils/weiToEth';

type CampaignCardProps = { campaignAddress: string };

export default function CampaignCard({ campaignAddress }: CampaignCardProps) {
  const { provider } = useWallet();
  const [info, setInfo] = useState<null | {
    name: string;
    description: string;
    goalEth: number;
    raisedEth: number;
  }>(null);

  useEffect(() => {
    if (!provider) return;

    const crowdfunding = new Contract(
      campaignAddress,
      CrowdfundingABI.abi,
      provider
    );

    (async () => {
      try {
        const [name, description, goalWei, raisedWei] = await Promise.all([
          crowdfunding.name(),
          crowdfunding.description(),
          crowdfunding.goal(),
          crowdfunding.getContractBalance(),
        ]);

        setInfo({
          name,
          description,
          goalEth: +weiToEth(goalWei),
          raisedEth: +weiToEth(raisedWei),
        });
      } catch (err) {
        console.error('[CampaignCard] fetch error →', err);
      }
    })();
  }, [campaignAddress, provider]);

  const pct = useMemo(() => {
    if (!info?.goalEth) return 0;
    return Math.min(100, (info.raisedEth / info.goalEth) * 100);
  }, [info]);

  if (!info)
    return (
      <div className="h-72 w-80 animate-pulse rounded-xl bg-slate-300/70" />
    );

  return (
    <div className="w-80 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-6 h-6 w-full overflow-hidden rounded-full bg-slate-800/90">
        <div
          className="relative flex h-full items-center justify-between rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 px-2 text-[11px] font-medium leading-none text-white"
          style={{ width: `${pct}%` }}
        >
          <span className="whitespace-nowrap">
            {info.raisedEth === 0 ? '$0' : `$${info.raisedEth}`}
          </span>
          {pct > 12 && (
            <span className="whitespace-nowrap">{pct.toFixed(0)}%</span>
          )}
        </div>
      </div>

      <h2 className="mb-2 text-2xl font-semibold text-slate-900">
        {info.name}
      </h2>
      <p className="mb-8 line-clamp-3 text-sm leading-relaxed text-slate-500">
        {info.description}
      </p>

      <Link
        href={`/campaign/${campaignAddress}`}
        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-indigo-700"
      >
        View Campaign
        <span aria-hidden>➜</span>
      </Link>
    </div>
  );
}
