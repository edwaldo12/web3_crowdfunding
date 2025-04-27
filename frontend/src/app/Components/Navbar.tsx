'use client';

import Image from 'next/image';
import Link from 'next/link';
import Batman from '@/app/src/batman.jpg';
import React from 'react';
import { useWallet } from '../context/Index';

const Navbar: React.FC = () => {
  const { account, connectWallet } = useWallet();

  return (
    <nav className="bg-slate-100 border-b-2 border-b-slate-300">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <Image
                src={Batman}
                alt="Logo"
                width={32}
                height={32}
                style={{ filter: 'drop-shadow(0px 0px 24px #a726a9a8)' }}
              />
            </div>

            <div className="hidden sm:ml-6 mt-1 sm:block">
              <div className="flex space-x-4">
                <Link href="/">
                  <p className="rounded-md px-3 py-2 text-sm font-medium text-slate-700">
                    Campaigns
                  </p>
                </Link>
                {account && (
                  <Link href={`/dashboard/${account}`}>
                    <p className="rounded-md px-3 py-2 text-sm font-medium text-slate-700">
                      Dashboard
                    </p>
                  </Link>
                )}
              </div>
            </div>
          </div>
          {account ? (
            <p className="text-sm text-slate-700">
              Connected: {account.slice(0, 6)}…{account.slice(-4)}
            </p>
          ) : (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
