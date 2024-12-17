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
import {config} from "../config";

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

            console.log('Data Provider daily fee set:', {
                txHash,
                dataProviderFeePDA: dataProviderFeePDA.toString()
            });
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
            console.log('Creating subscription:', {
                subscriber: this.provider.wallet.publicKey.toString(),
                dataProvider: params.dataProvider.toString(),
                recipient: params.recipient,
                durationInDays: params.durationInDays,
                nftTokenAccount: params.nftTokenAccount.toString()
            });

            const subscriber = this.provider.wallet.publicKey;
            const pdas = this.getProgramAddresses(params.dataProvider, subscriber);

            console.log('PDAs for subscription:', {
                statePDA: pdas.statePDA.toString(),
                subscriptionPDA: pdas.subscriptionPDA.toString(),
                subscribersListPDA: pdas.subscribersListPDA.toString()
            });

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

            console.log('ATAs for subscription:', {
                dataProviderATA: dp_payment_ata.toString(),
                subscriberATA: subscriber_payment_ata.toString(),
                ownerATA: owner_payment_ata.toString()
            });

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

            console.log('Subscription created:', {
                txHash,
                subscriptionPDA: pdas.subscriptionPDA.toString()
            });

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

    // adapters/solana-adapter.ts
    async getAgentSubscribers(agentAddress: PublicKey): Promise<PublicKey[]> {
        try {
            const [subscribersListPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("subscribers"), agentAddress.toBuffer()],
                this.program.programId
            );

            console.log('Fetching subscribers for agent:', {
                agent: agentAddress.toString(),
                subscribersListPDA: subscribersListPDA.toString()
            });

            try {
                // Try to fetch the subscribers list account
                const subscribersList = await this.program.account.subscribersList.fetch(
                    subscribersListPDA
                );

                console.log('Found subscribers:', subscribersList.subscribers.map(s => s.toString()));

                return subscribersList.subscribers;
            } catch (error) {
                console.log('No subscribers list found, returning empty array');
                return [];
            }
        } catch (error) {
            console.error('Error getting agent subscribers:', error);
            throw this.handleError(error);
        }
    }

// Also add this method to get active subscriptions
    async getActiveSubscriptionsForAgent(agentAddress: PublicKey): Promise<number> {
        try {
            // Get all subscribers first
            const subscribers = await this.getAgentSubscribers(agentAddress);

            // For each subscriber, check if they have an active subscription
            let activeCount = 0;

            for (const subscriber of subscribers) {
                const [subscriptionPDA] = PublicKey.findProgramAddressSync(
                    [
                        Buffer.from("subscription"),
                        subscriber.toBuffer(),
                        agentAddress.toBuffer(),
                    ],
                    this.program.programId
                );

                try {
                    const subscription = await this.program.account.subscription.fetch(
                        subscriptionPDA
                    );

                    // Check if subscription is active
                    if (subscription.endTime.gt(new BN(Math.floor(Date.now() / 1000)))) {
                        activeCount++;
                    }
                } catch (error) {
                    // Subscription not found or error, continue to next subscriber
                    continue;
                }
            }

            return activeCount;
        } catch (error) {
            console.error('Error getting active subscriptions:', error);
            throw this.handleError(error);
        }
    }

    async getSubscriptionsForProvider(providerPublicKey: PublicKey): Promise<SubscriberDetails[]> {
        try {
            console.log('Getting subscriptions for provider:', providerPublicKey.toString());

            // Get the subscribers list PDA
            const [subscribersListPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("subscribers"), providerPublicKey.toBuffer()],
                this.program.programId
            );

            // Get the list of subscribers
            const subscribersList = await this.program.account.subscribersList.fetch(
                subscribersListPDA
            );

            console.log('Found subscribers:', {
                count: subscribersList.subscribers.length,
                subscribers: subscribersList.subscribers.map(s => s.toString())
            });

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

                        console.log('Found subscription:', {
                            subscriber: subscriber.toString(),
                            pda: subscriptionPDA.toString(),
                            endTime: subscription.endTime.toString(),
                            recipient: subscription.recipient
                        });

                        return {
                            subscriber,
                            subscriptionPDA,
                            subscription,
                            status: this.getSubscriptionStatus(subscription.endTime)
                        };
                    } catch (error) {
                        console.log('No subscription found for subscriber:', subscriber.toString());
                        return null;
                    }
                })
            );

            // Filter out null values and sort by active status
            const validSubscriptions = subscriptions
                .filter((sub): sub is SubscriberDetails =>
                    sub !== null &&
                    sub.subscription.endTime.gt(new BN(Math.floor(Date.now() / 1000)))
                )
                .sort((a, b) => b.subscription.endTime.sub(a.subscription.endTime).toNumber());

            console.log('Active subscriptions found:', {
                total: validSubscriptions.length,
                subscriptions: validSubscriptions.map(sub => ({
                    subscriber: sub.subscriber.toString(),
                    pda: sub.subscriptionPDA.toString(),
                    endTime: sub.subscription.endTime.toString(),
                    recipient: sub.subscription.recipient,
                    status: sub.status
                }))
            });

            return validSubscriptions;
        } catch (error) {
            console.error('Error getting provider subscriptions:', error);
            throw this.handleError(error);
        }
    }

    async getAllSubscriptionsForUser(userPublicKey: PublicKey): Promise<SubscriptionStatus[]> {
        try {
            console.log('Getting subscriptions for user:', userPublicKey.toString());

            // Get all subscription accounts
            const subscriptionAccounts = await this.program.account.subscription.all();
            console.log('Total subscription accounts:', subscriptionAccounts.length);

            // Get all subscriber lists
            const subscriberLists = await this.program.account.subscribersList.all();
            console.log('Total subscriber lists:', subscriberLists.length);

            const userSubscriptions = [];

            // For each subscriber list
            for (const list of subscriberLists) {
                // Extract data provider from the subscriber list PDA
                // The PDA is created with [b"subscribers", data_provider.key().as_ref()]
                const [listPDA, _] = PublicKey.findProgramAddressSync(
                    [Buffer.from("subscribers"), list.publicKey.toBuffer()],
                    this.program.programId
                );

                // If this matches our list's PDA, we found a data provider
                if (listPDA.equals(list.publicKey)) {
                    const dataProvider = list.publicKey;

                    // Calculate what our subscription PDA would be with this provider
                    const [expectedSubPDA] = PublicKey.findProgramAddressSync(
                        [
                            Buffer.from("subscription"),
                            userPublicKey.toBuffer(),
                            dataProvider.toBuffer()
                        ],
                        this.program.programId
                    );

                    console.log('Checking for subscription:', {
                        provider: dataProvider.toString(),
                        expectedPDA: expectedSubPDA.toString()
                    });

                    // Look for this subscription in our accounts
                    const subscription = subscriptionAccounts.find(acc =>
                        acc.publicKey.equals(expectedSubPDA)
                    );

                    if (subscription) {
                        console.log('Found subscription:', {
                            provider: dataProvider.toString(),
                            pda: subscription.publicKey.toString(),
                            endTime: subscription.account.endTime.toString(),
                            recipient: subscription.account.recipient
                        });

                        userSubscriptions.push({
                            subscription: subscription.account,
                            subscriptionPDA: subscription.publicKey,
                            dataProvider,
                            status: this.getSubscriptionStatus(subscription.account.endTime)
                        });
                    }
                }
            }

            // Filter to only active subscriptions
            const activeSubscriptions = userSubscriptions.filter(sub =>
                sub.subscription.endTime.gt(new BN(Math.floor(Date.now() / 1000)))
            );

            console.log('Active subscriptions found:', {
                total: activeSubscriptions.length,
                subscriptions: activeSubscriptions.map(sub => ({
                    provider: sub.dataProvider.toString(),
                    pda: sub.subscriptionPDA.toString(),
                    endTime: sub.subscription.endTime.toString(),
                    recipient: sub.subscription.recipient,
                    status: sub.status
                }))
            });

            return activeSubscriptions;
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

            console.log('ATAs for subscription:', {
                dataProviderATA: dp_payment_ata.toString(),
                subscriberATA: subscriber_payment_ata.toString(),
                ownerATA: owner_payment_ata.toString()
            });

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

    /**
     * Register a new data provider with the subscription manager
     * Currently only callable by the contract owner
     * Additional contract owners to be added in the future
     */
    async mintRegistrationNFT(): Promise<{
        mint: PublicKey;
        tokenAccount: PublicKey;
    }> {
        if (!this.provider.wallet.publicKey) {
            throw new Error("Wallet not connected");
        }

        try {
            // Get the keypair from the wallet
            const payer = (this.provider.wallet as any).payer;
            if (!payer) {
                throw new Error("No payer found in wallet");
            }

            console.log('Creating mint with payer:', payer.publicKey.toString());

            // Create the mint account
            const mint = await createMint(
                this.provider.connection,
                payer,  // Use the payer directly
                this.provider.wallet.publicKey,
                null,
                0,
                undefined,
                { commitment: 'confirmed' },
                TOKEN_PROGRAM_ID
            );

            console.log('Created mint:', mint.toString());

            // Create associated token account
            const tokenAccount = await createAssociatedTokenAccount(
                this.provider.connection,
                payer,
                mint,
                this.provider.wallet.publicKey
            );

            console.log('Created token account:', tokenAccount.toString());

            // Mint one token
            await mintTo(
                this.provider.connection,
                payer,
                mint,
                tokenAccount,
                this.provider.wallet.publicKey,
                1
            );

            console.log('Minted token');

            return { mint, tokenAccount };
        } catch (error) {
            console.error('Error minting registration NFT:', error);
            // Add more detailed error information
            if (error instanceof Error) {
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack
                });
            }
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
