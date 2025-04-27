'use client';
import { Spinner } from '@/app/Components/Spinner';
import { useState, ChangeEvent } from 'react';

type Props = {
  busy: boolean;
  onAdd: (name: string, priceEth: string) => void;
};

export default function AddTierForm({ busy, onAdd }: Props) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const reset = () => {
    setName('');
    setPrice('');
  };

  const handleSubmit = () => {
    onAdd(name, price);
    reset();
  };

  return (
    <div className="mt-8 max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-800">+ Add Tier</h3>

      <label className="mb-3 block text-sm font-medium text-slate-700">
        Name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="e.g. Bronze"
        />
      </label>

      <label className="mb-5 block text-sm font-medium text-slate-700">
        Price (<span className="font-mono">ETH</span>)
        <input
          value={price}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPrice(e.target.value)
          }
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="0.05"
        />
      </label>

      <button
        disabled={busy || name.trim() === '' || price.trim() === ''}
        onClick={handleSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-300"
      >
        {busy ? <Spinner /> : 'Add Tier'}
      </button>
    </div>
  );
}
