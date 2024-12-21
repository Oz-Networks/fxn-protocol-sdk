"use strict";
// src/adapters/solana-adapter.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolanaAdapter = exports.SubscriptionErrorCode = void 0;
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const spl_token_2 = require("@solana/spl-token");
const subscription_manager_json_1 = __importDefault(require("../types/idl/subscription_manager.json"));
const config_1 = require("../config");
// Enhanced error types
var SubscriptionErrorCode;
(function (SubscriptionErrorCode) {
    SubscriptionErrorCode[SubscriptionErrorCode["PeriodTooShort"] = 6000] = "PeriodTooShort";
    SubscriptionErrorCode[SubscriptionErrorCode["AlreadySubscribed"] = 6001] = "AlreadySubscribed";
    SubscriptionErrorCode[SubscriptionErrorCode["InsufficientPayment"] = 6002] = "InsufficientPayment";
    SubscriptionErrorCode[SubscriptionErrorCode["InvalidNFTHolder"] = 6003] = "InvalidNFTHolder";
    SubscriptionErrorCode[SubscriptionErrorCode["SubscriptionNotFound"] = 6004] = "SubscriptionNotFound";
    SubscriptionErrorCode[SubscriptionErrorCode["QualityOutOfRange"] = 6005] = "QualityOutOfRange";
    SubscriptionErrorCode[SubscriptionErrorCode["SubscriptionAlreadyEnded"] = 6006] = "SubscriptionAlreadyEnded";
    SubscriptionErrorCode[SubscriptionErrorCode["ActiveSubscription"] = 6007] = "ActiveSubscription";
    SubscriptionErrorCode[SubscriptionErrorCode["NotOwner"] = 6008] = "NotOwner";
})(SubscriptionErrorCode || (exports.SubscriptionErrorCode = SubscriptionErrorCode = {}));
class SolanaAdapter {
    constructor(provider) {
        if (!config_1.config.subscriptionManagerAddress) {
            throw new Error('Program ID not found in environment variables');
        }
        this.provider = provider;
        this.program = new anchor_1.Program(subscription_manager_json_1.default, provider);
    }
    // adapters/solana-adapter.ts
    setDataProviderFee(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider.wallet.publicKey) {
                throw new Error("Wallet not connected");
            }
            try {
                const dataProvider = this.provider.wallet.publicKey;
                const [dataProviderFeePDA] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("fee"), dataProvider.toBuffer()], this.program.programId);
                const txHash = yield this.program.methods
                    .setDataProviderFee(new anchor_1.BN(params.fee))
                    .accounts({
                    dataProviderFee: dataProviderFeePDA,
                    dataProvider: dataProvider,
                    SystemProgram: web3_js_1.SystemProgram.programId,
                })
                    .rpc();
                console.log('Data Provider daily fee set:', {
                    txHash,
                    dataProviderFeePDA: dataProviderFeePDA.toString()
                });
                return txHash;
            }
            catch (error) {
                console.error('Error setting data provider fee:', error);
                throw this.handleError(error);
            }
        });
    }
    createSubscription(params) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const state = yield this.program.account.state.fetch(pdas.statePDA);
                // Get the associated token accounts for the payment
                const fxnMintAddress = new web3_js_1.PublicKey(config_1.config.fxnMintAddress);
                const dp_payment_ata = yield (0, spl_token_1.getAssociatedTokenAddress)(fxnMintAddress, params.dataProvider);
                const subscriber_payment_ata = yield (0, spl_token_1.getAssociatedTokenAddress)(fxnMintAddress, subscriber);
                const owner_payment_ata = yield (0, spl_token_1.getAssociatedTokenAddress)(fxnMintAddress, state.owner);
                console.log('ATAs for subscription:', {
                    dataProviderATA: dp_payment_ata.toString(),
                    subscriberATA: subscriber_payment_ata.toString(),
                    ownerATA: owner_payment_ata.toString()
                });
                const txHash = yield this.program.methods
                    .subscribe(params.recipient, new anchor_1.BN(Math.floor(Date.now() / 1000) + (params.durationInDays * 24 * 60 * 60)))
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
                    systemProgram: web3_js_1.SystemProgram.programId,
                    tokenProgram: spl_token_2.TOKEN_PROGRAM_ID,
                    nftTokenAccount: params.nftTokenAccount,
                    dpFeeAccount: pdas.dataProviderFeePDA,
                })
                    .rpc();
                console.log('Subscription created:', {
                    txHash,
                    subscriptionPDA: pdas.subscriptionPDA.toString()
                });
                return txHash;
            }
            catch (error) {
                console.error('Error creating subscription:', error);
                throw this.handleError(error);
            }
        });
    }
    getSubscriptionStatus(endTime) {
        const now = Math.floor(Date.now() / 1000);
        const endTimeSeconds = endTime.toNumber();
        const daysUntilExpiration = (endTimeSeconds - now) / (24 * 60 * 60);
        if (endTimeSeconds <= now) {
            return 'expired';
        }
        else if (daysUntilExpiration <= 7) {
            return 'expiring_soon';
        }
        return 'active';
    }
    getProviderTokenAccount(providerAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const nftMint = new web3_js_1.PublicKey(config_1.config.nftTokenAddress);
            try {
                const tokenAccount = yield (0, spl_token_1.getAssociatedTokenAddress)(nftMint, providerAddress, false);
                const tokenAccountInfo = yield this.provider.connection.getAccountInfo(tokenAccount);
                if (!tokenAccountInfo) {
                    throw new Error('Provider does not have the required NFT');
                }
                return tokenAccount;
            }
            catch (error) {
                console.error('Error getting provider token account:', error);
                throw this.handleError(error);
            }
        });
    }
    getSubscriptionsForProvider(providerPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Getting subscriptions for provider:', providerPublicKey.toString());
                // Get the subscribers list PDA
                const [subscribersListPDA] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("subscribers"), providerPublicKey.toBuffer()], this.program.programId);
                // Get the list of subscribers
                const subscribersList = yield this.program.account.subscribersList.fetch(subscribersListPDA);
                console.log('Found subscribers:', {
                    count: subscribersList.subscribers.length,
                    subscribers: subscribersList.subscribers.map(s => s.toString())
                });
                // Get subscription details for each subscriber
                const subscriptions = yield Promise.all(subscribersList.subscribers.map((subscriber) => __awaiter(this, void 0, void 0, function* () {
                    // Calculate subscription PDA for this subscriber
                    const [subscriptionPDA] = web3_js_1.PublicKey.findProgramAddressSync([
                        Buffer.from("subscription"),
                        subscriber.toBuffer(),
                        providerPublicKey.toBuffer()
                    ], this.program.programId);
                    try {
                        const subscription = yield this.program.account.subscription.fetch(subscriptionPDA);
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
                    }
                    catch (error) {
                        console.log('No subscription found for subscriber:', subscriber.toString());
                        return null;
                    }
                })));
                // Filter out null values and sort by active status
                const validSubscriptions = subscriptions
                    .filter((sub) => sub !== null &&
                    sub.subscription.endTime.gt(new anchor_1.BN(Math.floor(Date.now() / 1000))))
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
            }
            catch (error) {
                console.error('Error getting provider subscriptions:', error);
                throw this.handleError(error);
            }
        });
    }
    getAllSubscriptionsForUser(userPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Getting subscriptions for user:', userPublicKey.toString());
                // Get all subscription accounts
                const subscriptionAccounts = yield this.program.account.subscription.all();
                console.log('Total subscription accounts:', subscriptionAccounts.length);
                // Get all subscriber lists
                const subscriberLists = yield this.program.account.subscribersList.all();
                console.log('Total subscriber lists:', subscriberLists.length);
                const userSubscriptions = [];
                // For each subscriber list
                for (const list of subscriberLists) {
                    // Extract data provider from the subscriber list PDA
                    // The PDA is created with [b"subscribers", data_provider.key().as_ref()]
                    const [listPDA, _] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("subscribers"), list.publicKey.toBuffer()], this.program.programId);
                    // If this matches our list's PDA, we found a data provider
                    if (listPDA.equals(list.publicKey)) {
                        const dataProvider = list.publicKey;
                        // Calculate what our subscription PDA would be with this provider
                        const [expectedSubPDA] = web3_js_1.PublicKey.findProgramAddressSync([
                            Buffer.from("subscription"),
                            userPublicKey.toBuffer(),
                            dataProvider.toBuffer()
                        ], this.program.programId);
                        console.log('Checking for subscription:', {
                            provider: dataProvider.toString(),
                            expectedPDA: expectedSubPDA.toString()
                        });
                        // Look for this subscription in our accounts
                        const subscription = subscriptionAccounts.find(acc => acc.publicKey.equals(expectedSubPDA));
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
                const activeSubscriptions = userSubscriptions.filter(sub => sub.subscription.endTime.gt(new anchor_1.BN(Math.floor(Date.now() / 1000))));
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
            }
            catch (error) {
                console.error('Error in getAllSubscriptionsForUser:', error);
                throw this.handleError(error);
            }
        });
    }
    renewSubscription(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider.wallet.publicKey) {
                throw new Error("Wallet not connected");
            }
            try {
                const subscriber = this.provider.wallet.publicKey;
                const pdas = this.getProgramAddresses(params.dataProvider, subscriber);
                // Initialize quality info if it doesn't exist
                try {
                    yield this.program.account.qualityInfo.fetch(pdas.qualityPDA);
                }
                catch (e) {
                    yield this.program.methods
                        .initializeQualityInfo()
                        .accounts({
                        qualityInfo: pdas.qualityPDA,
                        dataProvider: params.dataProvider,
                        payer: subscriber,
                        systemProgram: web3_js_1.SystemProgram.programId,
                    })
                        .rpc();
                }
                // Get the state account to verify the owner
                const state = yield this.program.account.state.fetch(pdas.statePDA);
                // Get the associated token accounts for the payment
                const fxnMintAddress = new web3_js_1.PublicKey(config_1.config.fxnMintAddress);
                const dp_payment_ata = yield (0, spl_token_1.getAssociatedTokenAddress)(fxnMintAddress, params.dataProvider);
                const subscriber_payment_ata = yield (0, spl_token_1.getAssociatedTokenAddress)(fxnMintAddress, subscriber);
                const owner_payment_ata = yield (0, spl_token_1.getAssociatedTokenAddress)(fxnMintAddress, state.owner);
                console.log('ATAs for subscription:', {
                    dataProviderATA: dp_payment_ata.toString(),
                    subscriberATA: subscriber_payment_ata.toString(),
                    ownerATA: owner_payment_ata.toString()
                });
                // Send renewal transaction
                const txHash = yield this.program.methods
                    .renewSubscription(params.newRecipient, new anchor_1.BN(params.newEndTime), params.qualityScore)
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
                    systemProgram: web3_js_1.SystemProgram.programId,
                    tokenProgram: spl_token_2.TOKEN_PROGRAM_ID,
                    nftTokenAccount: params.nftTokenAccount,
                    dpFeeAccount: pdas.dataProviderFeePDA,
                })
                    .rpc();
                return txHash;
            }
            catch (error) {
                console.error('Error in renewSubscription:', error);
                throw this.handleError(error);
            }
        });
    }
    cancelSubscription(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider.wallet.publicKey) {
                throw new Error("Wallet not connected");
            }
            try {
                const subscriber = this.provider.wallet.publicKey;
                const pdas = this.getProgramAddresses(params.dataProvider, subscriber);
                const txHash = yield this.program.methods
                    .cancelSubscription(params.qualityScore)
                    .accounts({
                    subscriber: subscriber,
                    dataProvider: params.dataProvider,
                    subscription: pdas.subscriptionPDA,
                    qualityInfo: pdas.qualityPDA,
                    tokenProgram: spl_token_2.TOKEN_PROGRAM_ID,
                    nftTokenAccount: params.nftTokenAccount,
                })
                    .rpc();
                return txHash;
            }
            catch (error) {
                console.error('Error in cancelSubscription:', error);
                throw this.handleError(error);
            }
        });
    }
    getSubscriptionState(subscriptionPDA) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.program.account.subscription.fetch(subscriptionPDA);
            }
            catch (error) {
                console.error('Error fetching subscription state:', error);
                throw this.handleError(error);
            }
        });
    }
    getQualityInfo(dataProvider) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [qualityPDA] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("quality"), dataProvider.toBuffer()], this.program.programId);
                return yield this.program.account.qualityInfo.fetch(qualityPDA);
            }
            catch (error) {
                console.error('Error fetching quality info:', error);
                throw this.handleError(error);
            }
        });
    }
    getProgramAddresses(dataProvider, subscriber) {
        const [statePDA] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("state storage")], this.program.programId);
        const [qualityPDA] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("quality"), dataProvider.toBuffer()], this.program.programId);
        const [subscriptionPDA] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from("subscription"),
            subscriber.toBuffer(),
            dataProvider.toBuffer(),
        ], this.program.programId);
        const [subscribersListPDA] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("subscribers"), dataProvider.toBuffer()], this.program.programId);
        const [dataProviderFeePDA] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("fee"), dataProvider.toBuffer()], this.program.programId);
        return {
            statePDA,
            qualityPDA,
            subscriptionPDA,
            subscribersListPDA,
            dataProviderFeePDA,
        };
    }
    handleError(error) {
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
exports.SolanaAdapter = SolanaAdapter;
