'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Contract, ethers } from 'ethers';
import Link from 'next/link';

import CrowdfundingABI from '@/ABI/Crowdfunding.json';
import { useWallet } from '@/app/context/Index';
import { Tier } from './type';
import { fetchEthUsd, fmtEth, parseEth } from '@/app/utils/weiToEth';
import StatusChip from './Components/StatusChip';
import ProgressBar from './Components/ProgressBar';
import TierCard from './Components/TierCard';
import AddTierForm from './Components/AddTierForm';
const STATUS_LABEL = ['Active', 'Successful', 'Failed'] as const;

export default function CampaignPage() {
  /* ───────────────────────────────────────── provider / contract */
  const { campaignAddress } = useParams<{ campaignAddress: string }>();
  const { provider, signer, account } = useWallet();

  const crowdfunding = useMemo(
    () =>
      provider && campaignAddress
        ? new Contract(campaignAddress, CrowdfundingABI.abi, signer ?? provider)
        : null,
    [campaignAddress, provider, signer]
  );

  /* ───────────────────────────────────────── state */
  const [ethUsd, setEthUsd] = useState<number | null>(null);
  const [info, setInfo] = useState<null | {
    name: string;
    description: string;
    goal: bigint;
    deadline: bigint;
    raised: bigint;
    tiers: Tier[];
    funded: boolean[];
  }>(null);

  const [status, setStatus] = useState<number | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editing, setEditing] = useState(false);
  const [busyTier, setBusyTier] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* ───────────────────────────────────────── ETH-USD price */
  useEffect(() => {
    fetchEthUsd().then(setEthUsd);
  }, []);

  /* ───────────────────────────────────────── fetch campaign */
  const fetchCampaign = useCallback(async () => {
    if (!crowdfunding) return;
    setRefreshing(true);

    try {
      const [
        name,
        description,
        goal,
        deadline,
        raised,
        rawTiers,
        ownerAddr,
        rawStatus,
      ] = await Promise.all([
        crowdfunding.name(),
        crowdfunding.description(),
        crowdfunding.goal(),
        crowdfunding.deadline(),
        crowdfunding.getContractBalance(),
        crowdfunding.getTier(),
        crowdfunding.owner(),
        crowdfunding.getCampaignStatus(),
      ]);

      /* funded tiers for connected wallet */
      const funded: boolean[] = [];
      if (account) {
        for (let i = 0; i < rawTiers.length; i++) {
          funded.push(await crowdfunding.hasFundedTier(account, i));
        }
      }

      setInfo({
        name,
        description,
        goal,
        deadline,
        raised,
        tiers: rawTiers as Tier[],
        funded,
      });

      setStatus(Number(rawStatus));
      setIsOwner(
        !!account &&
          account.toLowerCase() === (ownerAddr as string).toLowerCase()
      );
    } finally {
      setRefreshing(false);
    }
  }, [crowdfunding, account]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  /* ───────────────────────────────────────── progress % */
  const pct = useMemo(() => {
    if (!info) return 0;
    const goal = Number(ethers.formatEther(info.goal));
    const raised = Number(ethers.formatEther(info.raised));
    return goal === 0 ? 0 : Math.min(100, (raised / goal) * 100);
  }, [info]);

  /* ───────────────────────────────────────── actions */
  const fundTier = async (idx: number, amount: bigint) => {
    if (!crowdfunding || !signer) return;
    setBusyTier(idx);
    try {
      await (await crowdfunding.fund(idx, { value: amount })).wait();
      fetchCampaign();
    } finally {
      setBusyTier(null);
    }
  };

  const removeTier = async (idx: number) => {
    if (!crowdfunding || !signer) return;
    setBusyTier(idx);
    try {
      await (await crowdfunding.removeTier(idx)).wait();
      fetchCampaign();
    } finally {
      setBusyTier(null);
    }
  };

  const addTier = async (name: string, priceEth: string) => {
    if (!crowdfunding || !signer) return;
    setAdding(true);
    try {
      await (
        await crowdfunding.addTier(name.trim(), parseEth(priceEth))
      ).wait();
      fetchCampaign();
    } finally {
      setAdding(false);
    }
  };

  /* ───────────────────────────────────────── loading skeleton */
  if (!info) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="h-96 animate-pulse rounded-xl bg-slate-100" />
      </main>
    );
  }

  /* ───────────────────────────────────────── render */
  const goalEth = Number(ethers.formatEther(info.goal));
  const raisedEth = Number(ethers.formatEther(info.raised));

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      {/* header row */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <h1 className="text-4xl font-extrabold text-slate-900">{info.name}</h1>

        <div className="flex items-center gap-3">
          <StatusChip label={STATUS_LABEL[status ?? 0]} />
          {isOwner && (
            <button
              onClick={() => setEditing((p) => !p)}
              className="rounded-md bg-indigo-600 px-4 py-1 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {editing ? 'Done' : 'Edit'}
            </button>
          )}
        </div>
      </div>

      {refreshing && (
        <div className="mb-6 h-1 w-full animate-pulse rounded-full bg-indigo-200" />
      )}

      {/* description & meta */}
      <section className="mb-8 space-y-4">
        <div>
          <h2 className="mb-1 text-lg font-semibold text-slate-800">
            Description:
          </h2>
          <p className="text-slate-600">{info.description}</p>
        </div>

        <div>
          <h2 className="mb-1 text-lg font-semibold text-slate-800">
            Deadline
          </h2>
          <p className="text-slate-600">
            {new Date(Number(info.deadline) * 1000).toDateString()}
          </p>
        </div>
      </section>

      {/* progress */}
      <ProgressBar
        pct={pct}
        goalLabel={fmtEth(goalEth, ethUsd)}
        raisedLabel={fmtEth(raisedEth, ethUsd)}
      />

      {/* tiers grid */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Tiers:</h2>

        <div className="grid gap-6 md:grid-cols-3">
          {info.tiers.map((tier, i) => (
            <TierCard
              key={i}
              idx={i}
              tier={tier}
              funded={info.funded[i]}
              isOwner={isOwner}
              editing={editing}
              busy={busyTier === i}
              ethUsd={ethUsd}
              onFund={() => fundTier(i, tier.amount)}
              onRemove={() => removeTier(i)}
            />
          ))}
        </div>

        {/* add-tier (owner + editing) */}
        {editing && isOwner && <AddTierForm busy={adding} onAdd={addTier} />}
      </section>

      <Link
        href="/"
        className="mt-16 inline-block text-sm text-indigo-600 hover:underline"
      >
        ← Back to all campaigns
      </Link>
    </main>
  );
}
