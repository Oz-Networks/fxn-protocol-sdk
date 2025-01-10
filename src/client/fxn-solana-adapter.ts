// src/adapters/solana-adapter.ts

import { Program, AnchorProvider, IdlAccounts, BN } from '@coral-xyz/anchor';
import {
    Connection,
    PublicKey,
    SystemProgram,
    LAMPORTS_PER_SOL,
    TransactionSignature, Signer
} from '@solana/web3.js';
import {
    createMint,
    getAssociatedTokenAddress,
    createAssociatedTokenAccount,
    mintTo
} from '@solana/spl-token';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { SubscriptionManager } from '../types/subscription_manager';
import IDL from '../types/idl/subscription_manager.json';
import { config } from '../config/index';

// Enhanced type definitions
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
    InvalidNFTHolder = 6003,
    SubscriptionNotFound = 6004,
    QualityOutOfRange = 6005,
    SubscriptionAlreadyEnded = 6006,
    ActiveSubscription = 6007,
    NotOwner = 6008,
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

    // adapters/solana-adapter.ts
    async setDataProviderFee(params: SetDataProviderFeeParams): Promise<TransactionSignature> {
        if (!this.provider.wallet.publicKey) {
            throw new Error("Wallet not connected");
        }

        try {
            const dataProvider = this.provider.wallet.publicKey;
            const [dataProviderFeePDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("fee"), dataProvider.toBuffer()],
                this.program.programId
            );
 

            const txHash = await this.program.methods
                .setDataProviderFee(new BN(params.fee))
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

    async createSubscription(params: CreateSubscriptionParams): Promise<TransactionSignature> {
        if (!this.provider.wallet.publicKey) {
            throw new Error("Wallet not connected");
        }

        try {
            const subscriber = this.provider.wallet.publicKey;
            const pdas = this.getProgramAddresses(params.dataProvider, subscriber);
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
                    subscribersList: pdas.subscribersListPDA,
                    owner: state.owner,
                    dataProviderPaymentAta: dp_payment_ata,
                    subscriberPaymentAta: subscriber_payment_ata,
                    ownerPaymentAta: owner_payment_ata,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    nftTokenAccount: params.nftTokenAccount,
                    dpFeeAccount: pdas.dataProviderFeePDA,
                } as any)
                .rpc();

            return txHash;
        } catch (error) {
            console.error('Error creating subscription:', error);
            throw this.handleError(error);
        }
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

    async getProviderTokenAccount(providerAddress: PublicKey): Promise<PublicKey> {
        const nftMint = new PublicKey(config.nftTokenAddress!);

        try {
            const tokenAccount = await getAssociatedTokenAddress(
                nftMint,
                providerAddress,
                false
            );

            const tokenAccountInfo = await this.provider.connection.getAccountInfo(tokenAccount);
            if (!tokenAccountInfo) {
                throw new Error('Provider does not have the required NFT');
            }

            return tokenAccount;
        } catch (error) {
            console.error('Error getting provider token account:', error);
            throw this.handleError(error);
        }
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

    async getAllSubscriptionsForUser(userPublicKey: PublicKey): Promise<SubscriptionStatus[]> {
        try {
            // 1. First get all SubscribersList accounts
            const allSubscriberLists = await this.program.account.subscribersList.all();
            const userSubscriptions = [];

            // 2. For each subscribers list
            for (const list of allSubscriberLists) {
                // This is the data provider's key since the list PDA is created with data_provider
                const dataProvider = list.account.subscribers.find(sub => sub.equals(userPublicKey));

                // If this user is in the list
                if (dataProvider) {
                    // 3. Derive the subscription PDA for this user and data provider pair
                    const [subscriptionPDA] = PublicKey.findProgramAddressSync(
                        [
                            Buffer.from("subscription"),
                            userPublicKey.toBuffer(),
                            dataProvider.toBuffer()
                        ],
                        this.program.programId
                    );

                    try {
                        // 4. Fetch the subscription account
                        const subscription = await this.program.account.subscription.fetch(subscriptionPDA);

                        if (subscription) {
                            userSubscriptions.push({
                                subscription,
                                subscriptionPDA,
                                dataProvider,
                                status: this.getSubscriptionStatus(subscription.endTime)
                            });
                        }
                    } catch (e) {
                        console.log(`No subscription found for provider ${dataProvider.toString()}`);
                        continue;
                    }
                }
            }

            // Filter to only active subscriptions
            return userSubscriptions.filter(sub =>
                sub.subscription.endTime.gt(new BN(Math.floor(Date.now() / 1000)))
            );
        } catch (error) {
            console.error('Error in getAllSubscriptionsForUser:', error);
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
                    nftTokenAccount: params.nftTokenAccount,
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

            const txHash = await this.program.methods
                .cancelSubscription(params.qualityScore)
                .accounts({
                    subscriber: subscriber,
                    dataProvider: params.dataProvider,
                    subscription: pdas.subscriptionPDA,
                    qualityInfo: pdas.qualityPDA,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    nftTokenAccount: params.nftTokenAccount,
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

    getProgramAddresses(dataProvider: PublicKey, subscriber: PublicKey): {
        statePDA: PublicKey;
        qualityPDA: PublicKey;
        subscriptionPDA: PublicKey;
        subscribersListPDA: PublicKey;
        dataProviderFeePDA: PublicKey;
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
            [Buffer.from("fee"), dataProvider.toBuffer()],
            this.program.programId
        );

        return {
            statePDA,
            qualityPDA,
            subscriptionPDA,
            subscribersListPDA,
            dataProviderFeePDA,
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
                case SubscriptionErrorCode.InvalidNFTHolder:
                    return new Error('Invalid NFT holder');
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
                default:
                    return new Error(`Unknown error: ${error.message}`);
            }
        }

        // If it's not a program error, return the original error
        return error instanceof Error ? error : new Error(String(error));
    }
}
