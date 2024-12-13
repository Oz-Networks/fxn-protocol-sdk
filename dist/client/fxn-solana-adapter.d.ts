import { Program, AnchorProvider, IdlAccounts, BN } from '@coral-xyz/anchor';
import { PublicKey, TransactionSignature } from '@solana/web3.js';
import type { SubscriptionManager } from '../types/subscription_manager';
export interface RenewParams {
    dataProvider: PublicKey;
    newRecipient: string;
    newEndTime: number;
    qualityScore: number;
    nftTokenAccount: PublicKey;
}
export interface CancelParams {
    dataProvider: PublicKey;
    qualityScore: number;
    nftTokenAccount?: PublicKey;
}
export interface SubscriptionState {
    endTime: BN;
    recipient: string;
}
export interface SubscriberDetails {
    subscriber: PublicKey;
    subscriptionPDA: PublicKey;
    subscription: {
        endTime: BN;
        recipient: string;
    };
    status: 'active' | 'expired' | 'expiring_soon';
}
type QualityInfoAccount = IdlAccounts<SubscriptionManager>['qualityInfo'];
type SubscriptionAccount = IdlAccounts<SubscriptionManager>['subscription'];
export declare enum SubscriptionErrorCode {
    PeriodTooShort = 6000,
    AlreadySubscribed = 6001,
    InsufficientPayment = 6002,
    InvalidNFTHolder = 6003,
    SubscriptionNotFound = 6004,
    QualityOutOfRange = 6005,
    SubscriptionAlreadyEnded = 6006,
    ActiveSubscription = 6007,
    NotOwner = 6008
}
export interface CreateSubscriptionParams {
    dataProvider: PublicKey;
    recipient: string;
    durationInDays: number;
    nftTokenAccount: PublicKey;
}
export interface SubscriptionStatus {
    status: 'active' | 'expired' | 'expiring_soon';
    subscription: SubscriptionAccount;
}
export declare class SolanaAdapter {
    program: Program<SubscriptionManager>;
    provider: AnchorProvider;
    constructor(provider: AnchorProvider);
    createSubscription(params: CreateSubscriptionParams): Promise<TransactionSignature>;
    getSubscriptionStatus(endTime: BN): 'active' | 'expired' | 'expiring_soon';
    getProviderTokenAccount(providerAddress: PublicKey): Promise<PublicKey>;
    getAgentSubscribers(agentAddress: PublicKey): Promise<PublicKey[]>;
    getActiveSubscriptionsForAgent(agentAddress: PublicKey): Promise<number>;
    getSubscriptionsForProvider(providerPublicKey: PublicKey): Promise<SubscriberDetails[]>;
    getAllSubscriptionsForUser(userPublicKey: PublicKey): Promise<SubscriptionStatus[]>;
    renewSubscription(params: RenewParams): Promise<TransactionSignature>;
    mintRegistrationNFT(): Promise<{
        mint: PublicKey;
        tokenAccount: PublicKey;
    }>;
    cancelSubscription(params: CancelParams): Promise<TransactionSignature>;
    getSubscriptionState(subscriptionPDA: PublicKey): Promise<SubscriptionAccount>;
    getQualityInfo(dataProvider: PublicKey): Promise<QualityInfoAccount>;
    getProgramAddresses(dataProvider: PublicKey, subscriber: PublicKey): {
        statePDA: PublicKey;
        qualityPDA: PublicKey;
        subscriptionPDA: PublicKey;
        subscribersListPDA: PublicKey;
    };
    private handleError;
}
export {};
