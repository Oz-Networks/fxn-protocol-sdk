// src/adapters/solana-adapter.ts

import { Program, AnchorProvider, IdlAccounts, BN } from '@coral-xyz/anchor';
import {
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    TransactionSignature
} from '@solana/web3.js';
import {
    getAssociatedTokenAddress
} from '@solana/spl-token';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { SubscriptionManager } from '@/types/subscription_manager';
import IDL from '../types/idl/subscription_manager.json';
import { config } from '../config/index';

// Enhanced type definitions
export interface RenewParams {
    dataProvider: PublicKey;
    newRecipient: string;
    newEndTime: number;
    qualityScore: number;
}

export interface CancelParams {
    dataProvider: PublicKey;
    qualityScore: number;
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

// Properly typed account interfaces
type QualityInfoAccount = IdlAccounts<SubscriptionManager>['qualityInfo'];
type StateAccount = IdlAccounts<SubscriptionManager>['state'];
type SubscriptionAccount = IdlAccounts<SubscriptionManager>['subscription'];

// Enhanced error types
export enum SubscriptionErrorCode {
    PeriodTooShort = 6000,
    AlreadySubscribed = 6001,
    InsufficientPayment = 6002,
    InvalidTokenAccount = 6003,
    SubscriptionNotFound = 6004,
    QualityOutOfRange = 6005,
    SubscriptionAlreadyEnded = 6006,
    ActiveSubscription = 6007,
    NotOwner = 6008,
    TooManyRequests = 6009,
    NoSubscriptionRequest = 6010,
    RequestNotApproved = 6011,
    Unauthorized = 6012,
    InvalidDataProvider = 6013,
    InvalidDataProviderFeeAccount = 6014,
    InvalidOwnerFeeAccount = 6015,
    InvalidDataProviderPaymentAccount = 6016,
    InvalidOwnerPaymentAccount = 6017,
    TooManySubscriptions = 6018,
    TooManySubscribers = 6019,
    InvalidIndex = 6020,
    AlreadyApproved = 6021,
    InvalidSubscriber = 6022,
    AlreadyRequested = 6023,
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
    capabilities: string[];
    fee: number;
}

export interface AgentProfile {
    pubkey: PublicKey;
    name: string;
    description: string;
    restrictSubscriptions: boolean;
    capabilities: string[];
    subscriberCount: number;
    fee: number;
}

export interface SubscriptionStatus {
    status: 'active' | 'expired' | 'expiring_soon';
    subscription: SubscriptionAccount;
}

export interface RequestStruct {
    subscriberPubkey: PublicKey,
    approved: boolean,
}

export interface QualityInfoParams {
    dataProvider: PublicKey;
    qualityScore: number;
}

export class SolanaAdapter {
    program: Program<SubscriptionManager>;
    provider: AnchorProvider;

    constructor(provider: AnchorProvider) {
        if (!config.subscriptionManagerAddress) {
            throw new Error('Program ID not found in environment variables');
        }

        this.provider = provider;
        this.program = new Program<SubscriptionManager>(
            IDL as SubscriptionManager,
            provider
        );
    }

    async registerAgent(params: AgentParams): Promise<TransactionSignature> {
        if (!this.provider.wallet.publicKey) {
            throw new Error("Wallet not connected");
        }

        try {
            const dataProvider = this.provider.wallet.publicKey;
            const [agentRegistrationPDA] = await PublicKey.findProgramAddressSync(
                [Buffer.from("agent_profile_registration"), dataProvider.toBuffer()],
                this.program.programId
            );
            const [subscriptionRequestsPDA] = await PublicKey.findProgramAddressSync(
                 [Buffer.from("subscription_requests"), dataProvider.toBuffer()],
                 this.program.programId
            );
            const [dataProviderFeePDA] = await PublicKey.findProgramAddressSync(
               [Buffer.from("data_provider_fee"), dataProvider.toBuffer()],
               this.program.programId
            );
            const [statePDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("state storage")],
                this.program.programId
            );

            const fxnMintAddress = new PublicKey(config.fxnMintAddress!);

            const dp_payment_ata = await getAssociatedTokenAddress(
                fxnMintAddress,
                dataProvider,
            );

            const fee = new BN(params.fee * LAMPORTS_PER_SOL);

            const txHash = await this.program.methods
                .registerAgent(
                    params.name,
                    params.description,
                    params.restrict_subscriptions,
                    params.capabilities,
                    fee
                )
                .accounts({
                    agentRegistration: agentRegistrationPDA,
                    subscriptionRequests: subscriptionRequestsPDA,
                    dataProviderFee: dataProviderFeePDA,
                    dataProviderPaymentAta: dp_payment_ata,
                    dataProvider: dataProvider,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    tokenMintAccount: fxnMintAddress,
                    state: statePDA,
                    SystemProgram: SystemProgram.programId,
                } as any)
                .rpc();

            return txHash;
        } catch (error) {
            console.error('Error registering agent:', error);
            throw this.handleError(error);
        }

    }

    async editAgentDetails(params: AgentParams): Promise<TransactionSignature> {
        if (!this.provider.wallet.publicKey) {
            throw new Error("Wallet not connected");
        }

        try {
            const dataProvider = this.provider.wallet.publicKey;
            const [agentRegistrationPDA] = await PublicKey.findProgramAddressSync(
                [Buffer.from("agent_profile_registration"), dataProvider.toBuffer()],
                this.program.programId
            );
            const [subscriptionRequestsPDA] = await PublicKey.findProgramAddressSync(
                [Buffer.from("subscription_requests"), dataProvider.toBuffer()],
                this.program.programId
            );
            const [dataProviderFeePDA] = await PublicKey.findProgramAddressSync(
               [Buffer.from("data_provider_fee"), dataProvider.toBuffer()],
               this.program.programId
            );

             const fee = new BN(params.fee * LAMPORTS_PER_SOL);

             const txHash = await this.program.methods
                .editAgentData(
                    params.name,
                    params.description,
                    params.restrict_subscriptions,
                    params.capabilities,
                    fee
                )
                .accounts({
                    agentRegistration: agentRegistrationPDA,
                    subscriptionRequests: subscriptionRequestsPDA,
                    dataProviderFee: dataProviderFeePDA,
                    dataProvider: dataProvider,
                    SystemProgram: SystemProgram.programId,
                } as any)
                .rpc();

            return txHash;
        } catch (error) {
            console.error('Error registering agent:', error);
            throw this.handleError(error);
        }

    }

    async getAgentDetails(dataProvider: PublicKey): Promise<AgentParams> {
        if (!this.provider.wallet.publicKey) {
            throw new Error("Wallet not connected");
        }

        try {
            const [agentRegistrationPDA] = await PublicKey.findProgramAddressSync(
                [Buffer.from("agent_profile_registration"), dataProvider.toBuffer()],
                this.program.programId
            );
            const [dataProviderFeePDA] = await PublicKey.findProgramAddressSync(
                [Buffer.from("data_provider_fee"), dataProvider.toBuffer()],
                this.program.programId
            );

            const agent = await this.program.account.agentRegistration.fetch(agentRegistrationPDA);
            const fee = await this.program.account.dataProviderFee.fetch(dataProviderFeePDA);

            const agentProfile: AgentParams = {
                name: agent.name,
                description: agent.description,
                restrict_subscriptions: agent.restrictSubscriptions,
                capabilities: agent.capabilities,
                fee: fee.fee.toNumber() / LAMPORTS_PER_SOL
            };

            return agentProfile;
        } catch (error) {
            console.error('Error fetching agent details:', error);
            throw this.handleError(error);
        }
    }

    async requestSubscription(params: RequestSubscriptionParams): Promise<TransactionSignature> {
        if (!this.provider.wallet.publicKey) {
            throw new Error("Wallet not connected");
        }

        try {
            const subscriber = this.provider.wallet.publicKey;
            const pdas = this.getProgramAddresses(params.dataProvider, subscriber);

            const txHash = await this.program.methods
                .requestSubscription()
                .accounts({
                    subscriber: subscriber,
                    dataProvider: params.dataProvider,
                    subscriptionRequests: pdas.subscriptionRequestsPDA,
                    SystemProgram: SystemProgram.programId,
                } as any)
                .rpc();

            return txHash;
        } catch (error) {
            console.error('Error requesting subscription:', error);
            throw this.handleError(error);
        }
    }

    async approveSubscriptionRequest(params: ApproveSubscriptionRequestParams): Promise<TransactionSignature> {
        if (!this.provider.wallet.publicKey) {
            throw new Error("Wallet not connected");
        }

        try {
            const dataProvider = this.provider.wallet.publicKey;
            const [subscriptionRequestsPDA] = await PublicKey.findProgramAddressSync(
                [Buffer.from("subscription_requests"), dataProvider.toBuffer()],
                this.program.programId
             );

            const txHash = await this.program.methods
                .approveRequest(new BN(params.requestIndex))
                .accounts({
                    subscriber: params.subscriberAddress,
                    dataProvider: dataProvider,
                    subscriptionRequests: subscriptionRequestsPDA,
                    SystemProgram: SystemProgram.programId,
                } as any)
                .rpc();

            return txHash;
        } catch (error) {
            console.error('Error approving subscription request:', error);
            throw this.handleError(error);
        }
    }

    async getSubscriptionRequests(dataProvider: PublicKey): Promise<RequestStruct[]> {
        if (!this.provider.wallet.publicKey) {
            throw new Error("Wallet not connected");
        }

        try {
            const [subscriptionRequestsPDA] = await PublicKey.findProgramAddressSync(
                [Buffer.from("subscription_requests"), dataProvider.toBuffer()],
                this.program.programId
            );
            const subscriptionRequests = await this.program.account.subscriptionRequests.fetch(
                subscriptionRequestsPDA
            );
            return subscriptionRequests.requests;
        } catch (error) {
            console.error('Error fetching subscription requests:', error);
            throw this.handleError(error);
        }
    }

    // adapters/solana-adapter.ts
    async setDataProviderFee(params: SetDataProviderFeeParams): Promise<TransactionSignature> {
        if (!this.provider.wallet.publicKey) {
            throw new Error("Wallet not connected");
        }

        try {
            const dataProvider = this.provider.wallet.publicKey;
            const [dataProviderFeePDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("data_provider_fee"), dataProvider.toBuffer()],
                this.program.programId
            );
 
            const fee = new BN(params.fee * LAMPORTS_PER_SOL);

            const txHash = await this.program.methods
                .setDataProviderFee(fee)
                .accounts({
                    dataProviderFee: dataProviderFeePDA,
                    dataProvider: dataProvider,
                    SystemProgram: SystemProgram.programId,
                } as any)
                .rpc();

            return txHash;
        } catch (error) {
            console.error('Error setting data provider fee:', error);
            throw this.handleError(error);
        }
    }

    async createSubscription(params: CreateSubscriptionParams): Promise<[TransactionSignature, TransactionSignature]> {
        if (!this.provider.wallet.publicKey) {
            throw new Error("Wallet not connected");
        }

        try {
            const subscriber = this.provider.wallet.publicKey;
            const pdas = this.getProgramAddresses(params.dataProvider, subscriber);
            const [subscriptionRequestsPDA] = await PublicKey.findProgramAddressSync(
                [Buffer.from("subscription_requests"), params.dataProvider.toBuffer()],
                this.program.programId
             );
             const [agentRegistrationPDA] = await PublicKey.findProgramAddressSync(
                [Buffer.from("agent_profile_registration"), params.dataProvider.toBuffer()],
                this.program.programId
             );
            // Get the state account to get the correct owner
            const state = await this.program.account.state.fetch(pdas.statePDA);

            // Get the associated token accounts for the payment
            const fxnMintAddress = new PublicKey(config.fxnMintAddress!);
            const dp_payment_ata = await getAssociatedTokenAddress(
                fxnMintAddress,
                params.dataProvider,
            );
            const subscriber_payment_ata = await getAssociatedTokenAddress(
                fxnMintAddress,
                subscriber,
            );
            const owner_payment_ata = await getAssociatedTokenAddress(
                fxnMintAddress,
                state.owner,
            );
            const txHash = await this.program.methods
                .subscribe(
                    params.recipient,
                    new BN(Math.floor(Date.now() / 1000) + (params.durationInDays * 24 * 60 * 60))
                )
                .accounts({
                    state: pdas.statePDA,
                    subscriber: subscriber,
                    dataProvider: params.dataProvider,
                    subscription: pdas.subscriptionPDA,
                    owner: state.owner,
                    dataProviderPaymentAta: dp_payment_ata,
                    subscriberPaymentAta: subscriber_payment_ata,
                    ownerPaymentAta: owner_payment_ata,
                    agentRegistration: agentRegistrationPDA,
                    subscriptionRequests: subscriptionRequestsPDA,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    dpFeeAccount: pdas.dataProviderFeePDA,
                } as any)
                .rpc();
            
            const subscriptionListTxHash = await this.subscriptionLists({ dataProvider: params.dataProvider });
            
            return [txHash, subscriptionListTxHash];
        } catch (error) {
            console.error('Error creating subscription:', error);
            throw this.handleError(error);
        }
    }

    async subscriptionLists(params: SubscriptionListParams): Promise<TransactionSignature> {
        if (!this.provider.wallet.publicKey) {
            throw new Error("Wallet not connected");
        }
        try {
            const subscriber = this.provider.wallet.publicKey;
            const pdas = this.getProgramAddresses(params.dataProvider, subscriber);

            const mySubscriptionsAccount = await this.provider.connection.getAccountInfo(pdas.mySubscriptionsPDA);
            const subscribersListAccount = await this.provider.connection.getAccountInfo(pdas.subscribersListPDA);

            const listParams: _SubscriptionListParams= {
                subscriber: subscriber,
                dataProvider: params.dataProvider,
                mySubscriptionsPDA: pdas.mySubscriptionsPDA,
                subscribersListPDA: pdas.subscribersListPDA,
            }

            let txHash: TransactionSignature;
            if (!!mySubscriptionsAccount && !!subscribersListAccount) {
                if (mySubscriptionsAccount.data.length < 8 + 4 + (200 * 32) || subscribersListAccount.data.length < 8 + 4 + (200 * 32)) {
                    txHash = await this.reallocSubscriptionLists(listParams);
                } else {
                    txHash = await this.addSubscriptionsLists(listParams);
                }
            } else {
                if (!!mySubscriptionsAccount) {
                    await this.initSubscribersList(listParams);
                    txHash = await this.reallocSubscriptionLists(listParams);
                } else if (!!subscribersListAccount) {
                    await this.initMySubscriptionsList(listParams);
                    txHash = await this.reallocSubscriptionLists(listParams);
                } else {
                    await this.initMySubscriptionsList(listParams);
                    await this.initSubscribersList(listParams);
                    txHash = await this.reallocSubscriptionLists(listParams);
                }
            }

            return txHash;
        } catch (error) {
            console.error('Error creating / adding to subscription lists:', error);
            throw this.handleError(error);
        }
    }

    async reallocSubscriptionLists(params: _SubscriptionListParams): Promise<TransactionSignature> {
        const tx = await this.program.methods
        .reallocAddSubscriptionsLists()
        .accounts({
            subscriber: params.subscriber,
            dataProvider: params.dataProvider,
            mySubscriptions: params.mySubscriptionsPDA,
            subscribersList: params.subscribersListPDA,
            systemProgram: SystemProgram.programId,
        } as any)
        .rpc();
        return tx;
    }

    async initMySubscriptionsList(params: _SubscriptionListParams): Promise<TransactionSignature> {
        const tx = await this.program.methods
        .initMySubscriptionsList()
        .accounts({
            subscriber: params.subscriber,
            dataProvider: params.dataProvider,
            mySubscriptions: params.mySubscriptionsPDA,
            subscribersList: params.subscribersListPDA,
            systemProgram: SystemProgram.programId,
        } as any)
        .rpc();
        return tx;
    }

    async initSubscribersList(params: _SubscriptionListParams): Promise<TransactionSignature> {
        const tx = await this.program.methods
        .initSubscribersList()
        .accounts({
            subscriber: params.subscriber,
            dataProvider: params.dataProvider,
            mySubscriptions: params.mySubscriptionsPDA,
            subscribersList: params.subscribersListPDA,
            systemProgram: SystemProgram.programId,
        } as any)
        .rpc();
        return tx;
    }

    async addSubscriptionsLists(params: _SubscriptionListParams): Promise<TransactionSignature> {
        const tx = await this.program.methods
        .addSubscriptionsLists()
        .accounts({
            subscriber: params.subscriber,
            dataProvider: params.dataProvider,
            mySubscriptions: params.mySubscriptionsPDA,
            subscribersList: params.subscribersListPDA,
            systemProgram: SystemProgram.programId,
        } as any)
        .rpc();
        return tx;
    }

    getSubscriptionStatus(endTime: BN): 'active' | 'expired' | 'expiring_soon' {
        const now = Math.floor(Date.now() / 1000);
        const endTimeSeconds = endTime.toNumber();
        const daysUntilExpiration = (endTimeSeconds - now) / (24 * 60 * 60);

        if (endTimeSeconds <= now) {
            return 'expired';
        } else if (daysUntilExpiration <= 7) {
            return 'expiring_soon';
        }
        return 'active';
    }

    async getSubscriptionsForProvider(providerPublicKey: PublicKey): Promise<SubscriberDetails[]> {
        try {
            // Get the subscribers list PDA
            const [subscribersListPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("subscribers"), providerPublicKey.toBuffer()],
                this.program.programId
            );

            // Get the list of subscribers
            const subscribersList = await this.program.account.subscribersList.fetch(
                subscribersListPDA
            );

            // Get subscription details for each subscriber
            const subscriptions = await Promise.all(
                subscribersList.subscribers.map(async (subscriber) => {
                    // Calculate subscription PDA for this subscriber
                    const [subscriptionPDA] = PublicKey.findProgramAddressSync(
                        [
                            Buffer.from("subscription"),
                            subscriber.toBuffer(),
                            providerPublicKey.toBuffer()
                        ],
                        this.program.programId
                    );

                    try {
                        const subscription = await this.program.account.subscription.fetch(
                            subscriptionPDA
                        );

                        return {
                            subscriber,
                            subscriptionPDA,
                            subscription,
                            status: this.getSubscriptionStatus(subscription.endTime)
                        };
                    } catch (error) {
                        console.error('No subscription found for subscriber:', subscriber.toString());
                        return null;
                    }
                })
            );

            // Filter out null values and sort by active status
            return subscriptions
                .filter((sub): sub is SubscriberDetails =>
                    sub !== null &&
                    sub.subscription.endTime.gt(new BN(Math.floor(Date.now() / 1000)))
                )
                .sort((a, b) => b.subscription.endTime.sub(a.subscription.endTime).toNumber());
        } catch (error) {
            console.error('Error getting provider subscriptions:', error);
            throw this.handleError(error);
        }
    }

    async getAllSubscriptionsForUser(userPublicKey: PublicKey): Promise<SubscriptionDetails[]> {
        try {
            // Get the mySubscriptions PDA
            const [mySubscriptionsPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("my_subscriptions"), userPublicKey.toBuffer()],
                this.program.programId
            );

            // Fetch the mySubscriptions account
            const mySubscriptions = await this.program.account.mySubscriptions.fetch(
                mySubscriptionsPDA
            );

            // Map over each data provider and get their subscription details
            const subscriptions = await Promise.all(
                mySubscriptions.providers.map(async (dataProvider) => {
                    // Calculate subscription PDA for this provider
                    const [subscriptionPDA] = PublicKey.findProgramAddressSync(
                        [
                            Buffer.from("subscription"),
                            userPublicKey.toBuffer(),
                            dataProvider.toBuffer()
                        ],
                        this.program.programId
                    );

                    try {
                        // Fetch the subscription account
                        const subscription = await this.program.account.subscription.fetch(
                            subscriptionPDA
                        );

                        return {
                            dataProvider,
                            subscription: subscriptionPDA,
                            endTime: subscription.endTime,
                            recipient: subscription.recipient,
                            status: this.getSubscriptionStatus(subscription.endTime)
                        } as SubscriptionDetails;
                    } catch (error) {
                        console.error(`Error fetching subscription for provider ${dataProvider.toString()}:`, error);
                        return null;
                    }
                })
            );

            // Filter out null values (failed fetches) and expired subscriptions
            // Sort by end time descending (most recent first)
            return subscriptions
                .filter((sub): sub is SubscriptionDetails =>
                    sub !== null &&
                    sub.endTime.gt(new BN(Math.floor(Date.now() / 1000)))
                )
                .sort((a, b) => b.endTime.sub(a.endTime).toNumber());

        } catch (error) {
            console.error('Error fetching user subscriptions:', error);
            throw this.handleError(error);
        }
    }

    async renewSubscription(params: RenewParams): Promise<TransactionSignature> {
        if (!this.provider.wallet.publicKey) {
            throw new Error("Wallet not connected");
        }

        try {
            const subscriber = this.provider.wallet.publicKey;
            const pdas = this.getProgramAddresses(params.dataProvider, subscriber);

            // Initialize quality info if it doesn't exist
            try {
                await this.program.account.qualityInfo.fetch(pdas.qualityPDA);
            } catch (e) {
                await this.program.methods
                    .initializeQualityInfo()
                    .accounts({
                        qualityInfo: pdas.qualityPDA,
                        dataProvider: params.dataProvider,
                        payer: subscriber,
                        systemProgram: SystemProgram.programId,
                    } as any)
                    .rpc();
            }

            // Get the state account to verify the owner
            const state = await this.program.account.state.fetch(pdas.statePDA) as StateAccount;

            // Get the associated token accounts for the payment
            const fxnMintAddress = new PublicKey(config.fxnMintAddress!);
            const dp_payment_ata = await getAssociatedTokenAddress(
                fxnMintAddress,
                params.dataProvider,
            );
            const subscriber_payment_ata = await getAssociatedTokenAddress(
                fxnMintAddress,
                subscriber,
            );
            const owner_payment_ata = await getAssociatedTokenAddress(
                fxnMintAddress,
                state.owner,
            );

            // Send renewal transaction
            const txHash = await this.program.methods
                .renewSubscription(
                    params.newRecipient,
                    new BN(params.newEndTime),
                    params.qualityScore
                )
                .accounts({
                    state: pdas.statePDA,
                    subscriber: subscriber,
                    dataProvider: params.dataProvider,
                    subscription: pdas.subscriptionPDA,
                    qualityInfo: pdas.qualityPDA,
                    owner: state.owner,
                    dataProviderPaymentAta: dp_payment_ata,
                    subscriberPaymentAta: subscriber_payment_ata,
                    ownerPaymentAta: owner_payment_ata,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    dpFeeAccount: pdas.dataProviderFeePDA,
                } as any)
                .rpc();

            return txHash;
        } catch (error) {
            console.error('Error in renewSubscription:', error);
            throw this.handleError(error);
        }
    }

    async cancelSubscription(params: CancelParams): Promise<TransactionSignature> {
        if (!this.provider.wallet.publicKey) {
            throw new Error("Wallet not connected");
        }

        try {
            const subscriber = this.provider.wallet.publicKey;
            const pdas = this.getProgramAddresses(params.dataProvider, subscriber);

            // Initialize quality info if it doesn't exist
            try {
                await this.program.account.qualityInfo.fetch(pdas.qualityPDA);
            } catch (e) {
                await this.program.methods
                    .initializeQualityInfo()
                    .accounts({
                        qualityInfo: pdas.qualityPDA,
                        dataProvider: params.dataProvider,
                        payer: subscriber,
                        systemProgram: SystemProgram.programId,
                    } as any)
                    .rpc();
            }

            const txHash = await this.program.methods
                .cancelSubscription(params.qualityScore)
                .accounts({
                    subscriber: subscriber,
                    dataProvider: params.dataProvider,
                    subscription: pdas.subscriptionPDA,
                    qualityInfo: pdas.qualityPDA,
                } as any)
                .rpc();

            return txHash;
        } catch (error) {
            console.error('Error in cancelSubscription:', error);
            throw this.handleError(error);
        }
    }

    async getSubscriptionState(subscriptionPDA: PublicKey): Promise<SubscriptionAccount> {
        try {
            return await this.program.account.subscription.fetch(subscriptionPDA) as SubscriptionAccount;
        } catch (error) {
            console.error('Error fetching subscription state:', error);
            throw this.handleError(error);
        }
    }

    async getQualityInfo(dataProvider: PublicKey): Promise<QualityInfoAccount> {
        try {
            const [qualityPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("quality"), dataProvider.toBuffer()],
                this.program.programId
            );
            return await this.program.account.qualityInfo.fetch(qualityPDA) as QualityInfoAccount;
        } catch (error) {
            console.error('Error fetching quality info:', error);
            throw this.handleError(error);
        }
    }

    async storeQualityInfo(params: QualityInfoParams): Promise<TransactionSignature> {
        if (!this.provider.wallet.publicKey) {
            throw new Error("Wallet not connected");
        }

        try {
            const subscriber = this.provider.wallet.publicKey;
            const dataProvider = params.dataProvider;
            const [qualityPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("quality"), dataProvider.toBuffer()],
                this.program.programId
            );

            // Initialize quality info if it doesn't exist
            try {
                await this.program.account.qualityInfo.fetch(qualityPDA);
            } catch (e) {
                await this.program.methods
                    .initializeQualityInfo()
                    .accounts({
                        qualityInfo: qualityPDA,
                        dataProvider: params.dataProvider,
                        payer: subscriber,
                        systemProgram: SystemProgram.programId,
                    } as any)
                    .rpc();
            }

            const txHash = await this.program.methods
                .storeDataQuality(params.qualityScore)
                .accounts({
                    qualityInfo: qualityPDA,
                    dataProvider: dataProvider,
                } as any)
                .rpc();

            return txHash;
        } catch (error) {
            console.error('Error storing quality info:', error);
            throw this.handleError(error);
        }
    }

    async getAllAgents(): Promise<AgentProfile[]> {
        if (!this.provider.wallet.publicKey) {
            throw new Error("Wallet not connected");
        }
        try {
            const agents = await this.program.account.agentRegistration.all();
            
            const agentProfiles = await Promise.all(agents.map(async (agent) => {
                const [dataProviderFeePDA] = PublicKey.findProgramAddressSync(
                    [Buffer.from("data_provider_fee"), agent.account.address.toBuffer()],
                    this.program.programId
                );
                const [subscribersListPDA] = PublicKey.findProgramAddressSync(
                    [Buffer.from("subscribers"), agent.account.address.toBuffer()],
                    this.program.programId
                );
                const feeAccount = await this.program.account.dataProviderFee.fetch(dataProviderFeePDA);

                const subscribersListAccount = await this.provider.connection.getAccountInfo(subscribersListPDA);

                let subscriberCount: number;

                if (!subscribersListAccount) {
                    subscriberCount = 0;
                } else {
                    const subList = await this.program.account.subscribersList.fetch(subscribersListPDA);
                    subscriberCount = subList.subscribers.length;
                }

                const fee = feeAccount.fee.toNumber() / LAMPORTS_PER_SOL;
                return {
                    pubkey: agent.account.address,
                    name: agent.account.name,
                    description: agent.account.description,
                    restrictSubscriptions: agent.account.restrictSubscriptions,
                    capabilities: agent.account.capabilities,
                    subscriberCount: subscriberCount,
                    fee: fee
                };
            }));
            
            return agentProfiles;
        } catch (error) {
            console.error('Error fetching agents:', error);
            throw this.handleError(error);
        }
    }

    getProgramAddresses(dataProvider: PublicKey, subscriber: PublicKey): {
        statePDA: PublicKey;
        qualityPDA: PublicKey;
        subscriptionPDA: PublicKey;
        subscribersListPDA: PublicKey;
        dataProviderFeePDA: PublicKey;
        mySubscriptionsPDA: PublicKey;
        subscriptionRequestsPDA: PublicKey;
    } {
        const [statePDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("state storage")],
            this.program.programId
        );

        const [qualityPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("quality"), dataProvider.toBuffer()],
            this.program.programId
        );

        const [subscriptionPDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("subscription"),
                subscriber.toBuffer(),
                dataProvider.toBuffer(),
            ],
            this.program.programId
        );

        const [subscribersListPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("subscribers"), dataProvider.toBuffer()],
            this.program.programId
        );

        const [dataProviderFeePDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("data_provider_fee"), dataProvider.toBuffer()],
            this.program.programId
        );

        const [mySubscriptionsPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("my_subscriptions"), subscriber.toBuffer()],
            this.program.programId
        );

        const [subscriptionRequestsPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("subscription_requests"), dataProvider.toBuffer()],
            this.program.programId
        );

        return {
            statePDA,
            qualityPDA,
            subscriptionPDA,
            subscribersListPDA,
            dataProviderFeePDA,
            mySubscriptionsPDA,
            subscriptionRequestsPDA,
        };
    }

    private handleError(error: any): Error {
        // Check if it's a program error with a code
        if (error.code !== undefined) {
            switch (error.code) {
                case SubscriptionErrorCode.PeriodTooShort:
                    return new Error('Subscription period is too short');
                case SubscriptionErrorCode.AlreadySubscribed:
                    return new Error('Already subscribed');
                case SubscriptionErrorCode.InsufficientPayment:
                    return new Error('Insufficient payment');
                case SubscriptionErrorCode.InvalidTokenAccount:
                    return new Error('Invalid token account');
                case SubscriptionErrorCode.SubscriptionNotFound:
                    return new Error('Subscription not found');
                case SubscriptionErrorCode.QualityOutOfRange:
                    return new Error('Quality score must be between 0 and 100');
                case SubscriptionErrorCode.SubscriptionAlreadyEnded:
                    return new Error('Subscription has already ended');
                case SubscriptionErrorCode.ActiveSubscription:
                    return new Error('Subscription is still active');
                case SubscriptionErrorCode.NotOwner:
                    return new Error('Not the contract owner');
                case SubscriptionErrorCode.TooManyRequests:
                    return new Error('Too many subscription requests');
                case SubscriptionErrorCode.NoSubscriptionRequest:
                    return new Error('No subscription request found');
                case SubscriptionErrorCode.RequestNotApproved:
                    return new Error('Subscription request not approved');
                case SubscriptionErrorCode.Unauthorized:
                    return new Error('Unauthorized');
                case SubscriptionErrorCode.InvalidDataProvider:
                    return new Error('Invalid data provider');
                case SubscriptionErrorCode.InvalidDataProviderFeeAccount:
                    return new Error('Invalid data provider fee account');
                case SubscriptionErrorCode.InvalidOwnerFeeAccount:
                    return new Error('Invalid owner fee account');
                case SubscriptionErrorCode.InvalidDataProviderPaymentAccount:
                    return new Error('Invalid data provider payment account');
                case SubscriptionErrorCode.InvalidOwnerPaymentAccount:
                    return new Error('Invalid owner payment account');
                case SubscriptionErrorCode.TooManySubscriptions:
                    return new Error('Too many subscriptions');
                case SubscriptionErrorCode.TooManySubscribers:
                    return new Error('Too many subscribers');
                case SubscriptionErrorCode.InvalidIndex:
                    return new Error('Invalid index');
                case SubscriptionErrorCode.AlreadyApproved:
                    return new Error('Already approved');
                case SubscriptionErrorCode.InvalidSubscriber:
                    return new Error('Invalid subscriber');
                case SubscriptionErrorCode.AlreadyRequested:
                    return new Error('Subscription already requested');
                default:
                    return new Error(`Unknown error: ${error.message}`);
            }
        }

        // If it's not a program error, return the original error
        return error instanceof Error ? error : new Error(String(error));
    }
}
