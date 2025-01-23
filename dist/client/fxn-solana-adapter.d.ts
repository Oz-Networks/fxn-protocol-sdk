import { Program, AnchorProvider, IdlAccounts, BN } from '@coral-xyz/anchor';
import { PublicKey, TransactionSignature } from '@solana/web3.js';
import type { SubscriptionManager } from '@/types/subscription_manager';
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
export interface SubscriptionDetails {
    dataProvider: PublicKey;
    subscription: PublicKey;
    endTime: BN;
    recipient: string;
}
export interface SetDataProviderFeeParams {
    fee: number;
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
}
export interface RequestSubscriptionParams {
    dataProvider: PublicKey;
}
export interface ApproveSubscriptionRequestParams {
    subscriberAddress: PublicKey;
    requestIndex: number;
}
export interface SubscriptionListParams {
    dataProvider: PublicKey;
}
interface _SubscriptionListParams {
    subscriber: PublicKey;
    dataProvider: PublicKey;
    mySubscriptionsPDA: PublicKey;
    subscribersListPDA: PublicKey;
}
export interface AgentParams {
    name: string;
    description: string;
    restrict_subscriptions: boolean;
    text: boolean;
    photo: boolean;
    video: boolean;
    telegram: boolean;
    twitter: boolean;
    discord: boolean;
    fee: number;
}
export interface SubscriptionStatus {
    status: 'active' | 'expired' | 'expiring_soon';
    subscription: SubscriptionAccount;
}
export declare class SolanaAdapter {
    program: Program<SubscriptionManager>;
    provider: AnchorProvider;
    constructor(provider: AnchorProvider);
    registerAgent(params: AgentParams): Promise<TransactionSignature>;
    editAgentDetails(params: AgentParams): Promise<TransactionSignature>;
    requestSubscription(params: RequestSubscriptionParams): Promise<TransactionSignature>;
    approveSubscriptionRequest(params: ApproveSubscriptionRequestParams): Promise<TransactionSignature>;
    setDataProviderFee(params: SetDataProviderFeeParams): Promise<TransactionSignature>;
    createSubscription(params: CreateSubscriptionParams): Promise<[TransactionSignature, TransactionSignature]>;
    subscriptionLists(params: SubscriptionListParams): Promise<TransactionSignature>;
    reallocSubscriptionLists(params: _SubscriptionListParams): Promise<TransactionSignature>;
    initMySubscriptionsList(params: _SubscriptionListParams): Promise<TransactionSignature>;
    initSubscribersList(params: _SubscriptionListParams): Promise<TransactionSignature>;
    addSubscriptionsLists(params: _SubscriptionListParams): Promise<TransactionSignature>;
    getSubscriptionStatus(endTime: BN): 'active' | 'expired' | 'expiring_soon';
    getProviderTokenAccount(providerAddress: PublicKey): Promise<PublicKey>;
    getSubscriptionsForProvider(providerPublicKey: PublicKey): Promise<SubscriberDetails[]>;
    getAllSubscriptionsForUser(userPublicKey: PublicKey): Promise<SubscriptionDetails[]>;
    renewSubscription(params: RenewParams): Promise<TransactionSignature>;
    cancelSubscription(params: CancelParams): Promise<TransactionSignature>;
    getSubscriptionState(subscriptionPDA: PublicKey): Promise<SubscriptionAccount>;
    getQualityInfo(dataProvider: PublicKey): Promise<QualityInfoAccount>;
    getProgramAddresses(dataProvider: PublicKey, subscriber: PublicKey): {
        statePDA: PublicKey;
        qualityPDA: PublicKey;
        subscriptionPDA: PublicKey;
        subscribersListPDA: PublicKey;
        dataProviderFeePDA: PublicKey;
        mySubscriptionsPDA: PublicKey;
        subscriptionRequestsPDA: PublicKey;
    };
    private handleError;
}
export {};
