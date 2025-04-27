'use client';

import { ethers } from 'ethers';
import { Tier } from '../type';
import { Spinner } from '@/app/Components/Spinner';
import { fmtEth } from '@/app/utils/weiToEth';

type Props = {
  idx: number;
  tier: Tier;
  funded: boolean;
  isOwner: boolean;
  editing: boolean;
  busy: boolean;
  ethUsd: number | null;
  onFund: () => void;
  onRemove: () => void;
};

export default function TierCard({
  tier,
  funded,
  isOwner,
  editing,
  busy,
  ethUsd,
  onFund,
  onRemove,
}: Props) {
  const amountEth = Number(ethers.formatEther(tier.amount));
  const priceLabel = fmtEth(amountEth, ethUsd);

  const btnBase =
    'flex items-center justify-center gap-2 rounded-md px-10 py-2 text-sm font-medium text-white';

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-6 flex items-start justify-between">
        <span className="text-2xl font-semibold text-slate-900">
          {tier.name}
        </span>
        <span className="text-xl font-semibold text-slate-900">
          {priceLabel}
        </span>
      </header>

      <p className="mb-6 text-sm text-slate-500">
        Total Backers: {tier.backers.toString()}
      </p>

      {editing && isOwner ? (
        <button
          disabled={busy}
          onClick={onRemove}
          className={`${btnBase} bg-red-600 hover:bg-red-700 disabled:bg-red-300`}
        >
          {busy ? <Spinner /> : 'Remove'}
        </button>
      ) : (
        <button
          disabled={funded || busy}
          onClick={onFund}
          className={`${btnBase} ${
            funded
              ? 'cursor-default bg-green-600'
              : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300'
          }`}
        >
          {busy ? <Spinner /> : funded ? 'Selected' : 'Select'}
        </button>
      )}
    </div>
  );
}
