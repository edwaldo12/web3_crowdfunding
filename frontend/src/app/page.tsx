'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Navbar from './Components/Navbar';
import { useWallet } from '@/app/context/Index';
import { Campaign } from './type';
import CampaignCard from './Components/CampaignCard';

type CreateCampaignModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

function CreateCampaignModal({
  open,
  onClose,
  onCreated,
}: CreateCampaignModalProps) {
  const { contract, signer } = useWallet();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('');
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setName('');
    setDesc('');
    setGoal('');
    setDuration('');
  };

  const handleSubmit = async () => {
    if (!contract || !signer) return;
    try {
      setBusy(true);
      await (
        await contract.createCampaign(
          name.trim(),
          desc.trim(),
          ethers.parseEther(goal.trim() === '' ? '0' : goal.trim()),
          Number(duration.trim() === '' ? '0' : duration.trim())
        )
      ).wait();

      reset();
      onClose();
      onCreated();
    } catch (err) {
      console.error('[createCampaign] error →', err);
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
        onClick={busy ? undefined : onClose}
      />

      {/* dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-slate-800">
            Create Campaign
          </h2>

          {/* form */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Description
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                rows={3}
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium text-slate-700">
                Goal (ETH)
                <input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="0.5"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Duration (days)
                <input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="30"
                />
              </label>
            </div>
          </div>

          {/* actions */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              disabled={busy}
              onClick={onClose}
              className="rounded-md bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
            >
              Cancel
            </button>
            <button
              disabled={
                busy ||
                name.trim() === '' ||
                goal.trim() === '' ||
                duration.trim() === ''
              }
              onClick={handleSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {busy && (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-25"
                  />
                  <path
                    d="M22 12a10 10 0 0 1-10 10"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="opacity-75"
                  />
                </svg>
              )}
              Create
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Home() {
  const { contract } = useWallet();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  /* fetch all campaigns (factory view) */
  const fetchAll = async () => {
    if (!contract) return;
    try {
      const raw = await contract.getAllCampaigns();
      setCampaigns(raw);
    } catch (err) {
      console.error('[getAllCampaigns] error →', err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [contract]);

  return (
    <div className="min-h-screen">
      <Navbar />
      {contract && (
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <div className="flex justify-end">
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Create Campaign
            </button>
          </div>
        </div>
      )}
      <main className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-4 text-4xl font-bold">Campaigns</h1>
        {campaigns.length ? (
          <ul className="flex flex-wrap gap-6">
            {campaigns.map((c) => (
              <CampaignCard
                key={c.campaignAddress}
                campaignAddress={c.campaignAddress}
              />
            ))}
          </ul>
        ) : (
          <p>No campaigns found.</p>
        )}
      </main>
      <CreateCampaignModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={fetchAll}
      />
    </div>
  );
}
