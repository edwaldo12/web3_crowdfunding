import { ContractTransactionResponse } from 'ethers';

export interface TierStruct {
  name: string;
  amount: bigint;
  backers: bigint;
}

export interface CrowdfundingContract {
  name(): Promise<string>;
  description(): Promise<string>;
  goal(): Promise<bigint>;
  deadline(): Promise<bigint>;
  tiers(index: number): Promise<TierStruct>;
  getContractBalance(): Promise<bigint>;

  fund(
    index: number,
    overrides?: { value: bigint }
  ): Promise<ContractTransactionResponse>;

  addTier(
    tierName: string,
    amount: bigint
  ): Promise<ContractTransactionResponse>;

  removeTier(index: number): Promise<ContractTransactionResponse>;

  withdraw(): Promise<ContractTransactionResponse>;
}
